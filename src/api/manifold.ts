import fetch from 'node-fetch';

interface ManifoldConfig {
  identityUrl: string;
  marketplaceUrl: string;
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
    resource: '/v1/resources',
  },
  connector: {
    sso: '/v1/sso',
  },
};

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
  connectorUrl: string;
  bearerToken: string | undefined;

  constructor(config: ManifoldConfig) {
    this.identityUrl = config.identityUrl;
    this.marketplaceUrl = config.marketplaceUrl;
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

  async getResourcesId(resourceId: string): Promise<Manifold.Resource> {
    const response = await fetch(`${this.marketplaceUrl}${routes.marketplace.resource}/${resourceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
    });

    return toJSON<Manifold.Resource>(response);
  }

  async getResources(): Promise<Manifold.Resource[]> {
    const response = await fetch(`${this.marketplaceUrl}${routes.marketplace.resource}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${this.bearerToken}`,
      },
    });

    return toJSON<Manifold.Resource[]>(response);
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
