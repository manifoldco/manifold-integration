import { ZeitClient, UiHookPayload } from '@zeit/integration-utils';

import { Metadata } from '../../types/Metadata';
import { Manifold } from '../api/manifold';

export const completeOAuth = async (
  payload: UiHookPayload,
  zeitClient: ZeitClient,
  manifoldClient: Manifold,
  metadata: Metadata
): Promise<void> => {
  try {
    const tokenInfo = await manifoldClient.getTokensOAuth(
      payload.query.code as string,
      payload.query.state as string
    );

    await zeitClient.setMetadata({
      ...metadata,
      manifoldToken: tokenInfo.body.token,
    });
  } catch (e) {
    throw new Error(`Could not authenticate you into manifold: ${e.message}`);
  }
};
