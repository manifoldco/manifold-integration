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
    };
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
