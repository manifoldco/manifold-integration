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
    credentials: '/v1/credentials',
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

    const opPayloads = await toJSON<Manifold.Provision[]>(opRes);

    const resources = resPayloads.map((resource: Manifold.Resource): Manifold.Resource => {
      const operation = opPayloads.filter(
        (op: Manifold.Provision) => op.state !== 'done' && op.resource_id === resource.id
      );

      let createdResource: Manifold.Resource;
      if (operation.length > 0 && operation[0].type === 'provision') {
        createdResource = {
          ...resource,
          state: 'provisioning',
        };
      } else if (operation.length > 0 && operation[0].type === 'deprovision') {
        createdResource = {
          ...resource,
          state: 'deprovisioning',
        };
      } else {
        createdResource = {
          ...resource,
          state: 'done',
        };
      }

      const product = products.find(p => p.id === resource.body.product_id);
      if (!product) {
        return {
          ...createdResource,
        };
      }

      const plan = product.plans.find(p => p.id === resource.body.plan_id);
      if (!plan) {
        return {
          ...createdResource,
          product,
        };
      }

      return {
        ...createdResource,
        product,
        plan,
      };
    });

    opPayloads.filter(
      (op: Manifold.Provision) => op.state !== 'done' && op.type === 'provision'
    ).forEach((operation) => {
      const resource = resources.find(res => res.id === operation.resource_id);

      if (!resource) {
        const product = products.find(p => p.id === operation.product_id);
        if (!product) {
          resources.push({
            id: operation.resource_id,
            state: 'provisioning',
            body: {
              ...(operation as Manifold.ResourceBody),
            },
          });
          return;
        }

        const plan = product.plans.find(p => p.id === operation.plan_id);
        if (!plan) {
          resources.push({
            id: operation.resource_id,
            state: 'provisioning',
            product,
            body: {
              ...(operation as Manifold.ResourceBody),
            },
          });
          return;
        }

        resources.push({
          id: operation.resource_id,
          state: 'provisioning',
          product,
          plan,
          body: {
            ...(operation as Manifold.ResourceBody),
          },
        });
      }
    });

    return resources;
  }

  async getResourcesId(resourceId: string): Promise<Manifold.Resource> {
    let state = 'done';

    const opRes = await fetch(
      `${this.provisioningUrl}${
        routes.provisioning.operations
        }?is_deleted=false&resource_id=${resourceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    const operations = await toJSON<Manifold.Provision[]>(opRes);
    const operation = operations.filter(op => op.state !== 'done');

    if (operation.length > 0 && operation[0].type === 'provision') {
      return {
        id: operation[0].resource_id,
        state: 'provisioning',
        body: {
          ...(operation[0] as Manifold.ResourceBody),
        },
      };
    }
    if (operation.length > 0 && operation[0].type === 'deprovision') {
      state = 'deprovision';
    }

    const resRes = await fetch(
      `${this.marketplaceUrl}${routes.marketplace.resources}/${resourceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    const resource = await toJSON<Manifold.Resource>(resRes);

    const product = products.find(p => p.id === resource.body.product_id);
    if (!product) {
      return {
        ...resource,
        state,
      };
    }

    const plan = product.plans.find(p => p.id === resource.body.plan_id);
    if (!plan) {
      return {
        ...resource,
        state,
        product,
      };
    }

    return {
      ...resource,
      state,
      product,
      plan,
    };
  }

  async getCredentials(resourceIds?: string[]): Promise<Manifold.Credential[]> {
    let queryParams = '';
    if (resourceIds && resourceIds.length) {
      queryParams = resourceIds.reduce((value, resourceId) => `${value}&resource_id=${resourceId}`, '?');
    }

    const resRes = await fetch(
      `${this.marketplaceUrl}${routes.marketplace.credentials}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    return toJSON<Manifold.Credential[]>(resRes);
  }

  async provisionProduct(
    provision: Manifold.Provision,
    userId: string
  ): Promise<Manifold.Provision> {
    const operationId = newID('operation');
    const resourceId = newID('resource');
    const data = {
      type: 'operation',
      version: 1,
      id: operationId,
      body: {
        user_id: userId,
        features: {},
        label: `zeit-${resourceId}`,
        name: provision.name,
        message: '',
        plan_id: provision.plan_id,
        product_id: provision.product_id,
        region_id: provision.region_id,
        resource_id: resourceId,
        source: 'catalog',
        state: 'provision',
        type: 'provision',
      },
    };

    const opRes = await fetch(`${this.provisioningUrl}${routes.provisioning.operations}/${operationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify(data),
    });

    const result = await toJSON<Manifold.Provision>(opRes);

    return {
      ...result,
      resource_id: resourceId,
    };
  }

  async deprovisionResource(resourceId: string, userId: string): Promise<Manifold.Deprovision> {
    const opID = newID('operation');
    const data = {
      type: 'operation',
      version: 1,
      id: opID,
      body: {
        user_id: userId,
        resource_id: resourceId,
        state: 'deprovision',
        type: 'deprovision',
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

    return toJSON<Manifold.Deprovision>(opRes);
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
