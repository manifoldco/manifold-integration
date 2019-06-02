import fetch from 'node-fetch';
import { encode } from 'base32';
import crypto from 'crypto';

import products from '../data/products';

interface ManifoldConfig {
  manifoldScheme: string;
  manifoldHost: string;
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

function getType(typeStr: string): Uint8Array {
  if (typeStr === 'resource') {
    return new Uint8Array([0x01, 0x90]);
  }
  if (typeStr === 'operation') {
    return new Uint8Array([0x01, 0x2c]);
  }

  throw new Error(`invalid type ${typeStr}`);
}

export function newID(typeStr: string): string {
  const typ = getType(typeStr);
  const id = new Uint8Array(18);

  id[0] = 0x10 | typ[0]; // eslint-disable-line no-bitwise
  id[1] = typ[1]; // eslint-disable-line prefer-destructuring
  id.set(crypto.randomFillSync(new Uint8Array(16)), 2);

  return encode(id);
}

async function toJSON<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message);
  }

  return payload;
}

export class Manifold {
  manifoldScheme: string;
  manifoldHost: string;
  identityUrl: string;
  marketplaceUrl: string;
  provisioningUrl: string;
  connectorUrl: string;
  bearerToken: string | undefined;

  constructor(config: ManifoldConfig) {
    this.manifoldScheme = config.manifoldScheme;
    this.manifoldHost = config.manifoldHost;
    this.identityUrl = this.serviceURL('identity');
    this.marketplaceUrl = this.serviceURL('marketplace');
    this.connectorUrl = this.serviceURL('connector');
    this.provisioningUrl = this.serviceURL('provisioning');
    this.bearerToken = config.bearerToken;
  }

  private serviceURL(svcName: string): string {
    return `${this.manifoldScheme}://api.${svcName}.${this.manifoldHost}`;
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

  async getResources(): Promise<Manifold.Resource[]> {
    const resRes = await fetch(`${this.marketplaceUrl}${routes.marketplace.resources}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
    });

    const resPayloads = await toJSON<Manifold.Resource[]>(resRes);

    const resources = resPayloads.map((resource: Manifold.Resource): Manifold.Resource => {
      const product = products.find(p => p.id === resource.body.product_id);
      if (!product) {
        return {
          ...resource,
          state: 'done',
        };
      }

      const plan = product.plans.find(p => p.id === resource.body.plan_id);
      if (!plan) {
        return {
          ...resource,
          state: 'done',
          product,
        };
      }

      return {
        ...resource,
        state: 'done',
        product,
        plan,
      };
    });

    const opRes = await fetch(`${this.provisioningUrl}${routes.provisioning.operations}?is_deleted=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    const opPayloads = await toJSON<Manifold.Provision[]>(opRes);

    const opResources = opPayloads
      .filter((operation: Manifold.Provision) => operation.state !== 'done')
      .map((operation: Manifold.Provision): Manifold.Resource => {
        const product = products.find(p => p.id === operation.product_id);
        if (!product) {
          return {
            id: operation.resource_id,
            state: 'provisioning',
            body: {
              ...operation as Manifold.ResourceBody,
            },
          };
        }

        const plan = product.plans.find(p => p.id === operation.plan_id);
        if (!plan) {
          return {
            id: operation.resource_id,
            state: 'provisioning',
            body: {
              ...operation as Manifold.ResourceBody,
            },
            product,
          };
        }

        return {
          id: operation.resource_id,
          state: 'provisioning',
          body: {
            ...operation as Manifold.ResourceBody,
          },
          product,
          plan,
        };
      });

    resources.push(...opResources);

    return resources;
  }

  async getResourcesId(resourceId: string): Promise<Manifold.Resource> {
    let resource: Manifold.Resource;
    try {
      const resRes = await fetch(`${this.marketplaceUrl}${routes.marketplace.resources}/${resourceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      });

      resource = await toJSON<Manifold.Resource>(resRes);
    } catch (e) {
      const opRes = await fetch(
        `${this.provisioningUrl}${routes.provisioning.operations}?is_deleted=false&resource_id=${resourceId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${this.bearerToken}`,
          },
        }
      );

      const operation = await toJSON<Manifold.Provision>(opRes);

      resource = {
        id: operation.resource_id,
        state: 'provisioning',
        body: {
          ...operation as Manifold.ResourceBody,
        },
      };
    }

    const product = products.find(p => p.id === resource.body.product_id);
    if (!product) {
      return resource;
    }

    const plan = product.plans.find(p => p.id === resource.body.plan_id);
    if (!plan) {
      return {
        ...resource,
        product,
      };
    }

    return {
      ...resource,
      product,
      plan,
    };
  }

  async provisionProduct(provision: Manifold.Provision, userId: string): Promise<Manifold.Provision> {
    const opID = newID('operation');
    const resID = newID('resource');
    const data = {
      type: 'operation',
      version: 1,
      id: opID,
      body: {
        user_id: userId,
        features: {},
        label: `zeit-${resID}`,
        name: provision.name,
        message: '',
        plan_id: provision.plan_id,
        product_id: provision.product_id,
        region_id: provision.region_id,
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

    return toJSON<Manifold.Provision>(opRes);
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
