import { ZeitClient, UiHookPayload } from '@zeit/integration-utils';

import { Metadata } from '../types';
import { Manifold } from '../api/manifold';

export const completeOAuth = async (
  payload: UiHookPayload,
  zeitClient: ZeitClient,
  manifoldClient: Manifold,
  metadata: Metadata
) : Promise<void> => {
  const tokenInfo = await manifoldClient.getTokensOAuth(
    payload.query.code as string,
    payload.query.state as string
  );

  const err = tokenInfo as Manifold.Error;
  if (err.message) {
    throw new Error(`Could not authenticate you into manifold: ${err.message}`);
  }
  const casted = tokenInfo as Manifold.AuthToken;

  await zeitClient.setMetadata({
      ...metadata,
      manifoldToken: casted.body.token,
  });
};
