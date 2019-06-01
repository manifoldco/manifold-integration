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

async function toJSON<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message);
  }

  return payload;
}

export class Manifold {
  identityUrl: string;
  bearerToken: string | undefined;

  constructor(config: ManifoldConfig) {
    this.identityUrl = config.identityUrl;
    this.bearerToken = config.bearerToken;
  }

  async getTokensOAuth(code: string, state: string): Promise<Manifold.AuthToken> {
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

    return toJSON<Manifold.AuthToken>(response);
  }

  async getSelf(): Promise<Manifold.User> {
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
    return toJSON<Manifold.User>(response);
  }
}
