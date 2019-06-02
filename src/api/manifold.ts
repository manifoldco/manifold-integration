import fetch from 'node-fetch';
import products from '../data/products';
import { encode } from 'base32';
import crypto from 'crypto';

interface ManifoldConfig {
  identityUrl: string;
  marketplaceUrl: string;
  provisioningUrl: string;
  connectorUrl: string;
  bearerToken: string | undefined;
}

const routes = {
  identity: {
    login: '/v1/tokens/oauth',
    link: '/v1/users/link/oauth',
    self: '/v1/self',
  },
  marketplace: {
    resources: '/v1/resources',
  },
  connector: {
    sso: '/v1/sso',
  },
  provisioning: {
    operations: '/v1/operations',
  },
};

export function newID(typeStr: string): string {
  const typ = getType(typeStr);
  const id = new Uint8Array(18);

  id[0] = 0x10 | typ[0]; // eslint-disable-line no-bitwise
  id[1] = typ[1]; // eslint-disable-line prefer-destructuring
  id.set(crypto.randomFillSync(new Uint8Array(16)), 2);

  return encode(id);
}

function getType(typeStr: string): Uint8Array {
  if (typeStr === 'resource') {
    return new Uint8Array([0x01, 0x90]);
  } else if (typeStr === 'operation') {
    return new Uint8Array([0x01, 0x2c]);
  }

  throw new Error(`invalid type ${typeStr}`);
}

async function toJSON<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message);
  }

  return payload;
}

export class Manifold {
  identityUrl: string;
  marketplaceUrl: string;
  provisioningUrl: string;
  connectorUrl: string;
  bearerToken: string | undefined;

  constructor(config: ManifoldConfig) {
    this.identityUrl = config.identityUrl;
    this.marketplaceUrl = config.marketplaceUrl;
    this.provisioningUrl = config.provisioningUrl;
    this.connectorUrl = config.connectorUrl;
    this.bearerToken = config.bearerToken;
  }

  async getTokensOAuth(code: string, state: string): Promise<Manifold.AuthToken> {
    const response = await fetch(`${this.identityUrl}${routes.identity.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        source: 'zeit',
        state,
      }),
    });

    return toJSON<Manifold.AuthToken>(response);
  }

  async getSelf(): Promise<Manifold.User> {
    const response = await fetch(`${this.identityUrl}${routes.identity.self}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
    });

    return toJSON<Manifold.User>(response);
  }

  async getResources(): Promise<Array<Manifold.Resource>> {
    const resRes = await fetch(`${this.marketplaceUrl}${routes.marketplace.resources}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
    });

    const resPayloads = await toJSON<any>(resRes);

    const resources = resPayloads.map(
      (r: any): Manifold.Resource => {
        r.product = products.find(p => p.id === r.body['product_id']);
        return r;
      }
    );

    const opRes = await fetch(
      `${this.provisioningUrl}${routes.provisioning.operations}?is_deleted=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    const opPayloads = await toJSON<any>(opRes);

    const opResources = opPayloads
      .filter((o: any) => o.body.state !== 'done')
      .map(
        (o: any): Manifold.Resource => {
          o.id = o.body.resource_id;
          o.product = products.find(p => p.id === o.body['product_id']);
          o.state = 'provisioning';
          return o;
        }
      );

    resources.push(...opResources);

    return resources;
  }

  async provisionProduct(provision: Manifold.Provision, userId: string): Promise<void> {
    const opID = newID('operation');
    const resID = newID('resource');
    const data = {
      type: 'operation',
      version: 1,
      id: opID,
      body: {
        user_id: userId,
        features: provision.features || {},
        label: `zeit-${resID}`,
        name: provision.name,
        message: '',
        plan_id: provision.planId,
        product_id: provision.productId,
        region_id: provision.regionId,
        resource_id: resID,
        source: 'catalog',
        state: 'provision',
        type: 'provision',
      },
    };
    const opRes = await fetch(`${this.provisioningUrl}${routes.provisioning.operations}/${opID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify(data),
    });

    await toJSON<any>(opRes);
  }

  async getResource(): Promise<Manifold.Resource> {
    return {
      id: '2688v5x89fmx3y6ec79z7buvpp3yc',
      body: {
        name: 'Test',
        label: 'test',
        product_id: '234mrgjbfx5ah48ccxx7wr8c2xb8c',
        plan_id: '235auzvmuuxhp93ry864bgbpfygxe',
        region_id: '235mhkk15ky7ha9qpu4gazrqjt2gr',
        annotations: {},
      },
    } as Manifold.Resource;
  }

  async getSso(resourceId: string): Promise<Manifold.AuthorizationCode> {
    const response = await fetch(`${this.connectorUrl}${routes.connector.sso}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify({
        body: {
          resource_id: resourceId,
        },
      }),
    });

    return toJSON<Manifold.AuthorizationCode>(response);
  }
}
