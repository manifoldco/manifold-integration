import fetch from 'node-fetch';
import { ZeitClient, UiHookPayload } from '@zeit/integration-utils';

import { Metadata } from '../types';

const { MANIFOLD_OAUTH_URL } = process.env;

const oauthRoutes = {
  login: '/v1/tokens/oauth',
  link: '/v1/users/link/oauth',
};

export const completeOAuth = async (
  payload: UiHookPayload,
  zeitClient: ZeitClient,
  metadata: Metadata
) : Promise<void> => {
  const response = await fetch(
    `${MANIFOLD_OAUTH_URL}${oauthRoutes.login}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code: payload.query.code,
        source: 'zeit',
        state: payload.query.state,
      }),
    }
  );

  if (response.status !== 201) {
    throw new Error(
      `Could not authenticate you on manifold: ${response.status} error: ${await response.text()}`
    );
  }

  const tokenInfo = await response.json();
  if (tokenInfo.error) {
    throw new Error(`Manifold OAuth issue: ${tokenInfo.error.message}`);
  }

  console.log({
    ...metadata,
    manifoldToken: tokenInfo.body.token,
  });
  await zeitClient.setMetadata({
      ...metadata,
      manifoldToken: tokenInfo.body.token,
  });
};
