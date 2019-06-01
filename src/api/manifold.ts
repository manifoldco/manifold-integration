import fetch from 'node-fetch';

interface ManifoldConfig {
  identityUrl: string;
  bearerToken: string | undefined;
}

const routes = {
  identity: {
    login: '/v1/tokens/oauth',
    link: '/v1/users/link/oauth',
    self: '/v1/self',
  },
};

export class Manifold {
  identityUrl: string;
  bearerToken: string | undefined;

  constructor(config: ManifoldConfig) {
    this.identityUrl = config.identityUrl;
    this.bearerToken = config.bearerToken;
  }

  async getTokensOAuth(code: string, state: string): Promise<Manifold.AuthToken | Manifold.Error> {
    const response = await fetch(
      `${this.identityUrl}${routes.identity.login}`,
      {
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
      }
    );

    return response.json();
  }

  async getSelf(): Promise<Manifold.User | Manifold.Error> {
    const response = await fetch(
      `${this.identityUrl}${routes.identity.self}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${this.bearerToken}`,
        },
      }
    );

    return response.json();
  }
}
