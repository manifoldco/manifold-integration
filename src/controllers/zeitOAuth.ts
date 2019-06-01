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

  if (tokenInfo instanceof Error) {
    throw new Error(`Could not authenticate you into manifold: ${tokenInfo.message}`);
  }

  await zeitClient.setMetadata({
      ...metadata,
      manifoldToken: tokenInfo.body.token,
  });
};
