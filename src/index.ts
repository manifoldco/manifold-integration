import { withUiHook } from '@zeit/integration-utils';

import { completeOAuth } from './controllers/zeitOAuth';
import authenticatedView from './views/authenticated';
import unauthenticatedView from './views/unauthenticated';
import productView from './views/product';
import testProvisionView from './views/test-provision';
import { TEST_PROVISION, PRODUCT_PAGE } from './constants';
import { Manifold } from './api/manifold';
import error from './views/error';
import { router } from './api/router';

const { MANIFOLD_IDENTITY_URL } = process.env;

export default withUiHook(
  async ({ zeitClient, payload }): Promise<string> => {
    let metadata = await zeitClient.getMetadata();
    const { action /* , projectId */ } = payload;

    if (!MANIFOLD_IDENTITY_URL) {
      return error('500', 'Missing configuration in the integration.');
    }

    const client = new Manifold({
      identityUrl: MANIFOLD_IDENTITY_URL,
      bearerToken: metadata.manifoldToken,
    });

    if (!metadata.manifoldToken && payload.query.code) {
      await completeOAuth(payload, zeitClient, client, metadata);
      metadata = await zeitClient.getMetadata();
      client.bearerToken = metadata.manifoldToken;
    }

    if (metadata.manifoldToken) {
      try {
        const user = await client.getSelf();

        return router({
          [TEST_PROVISION]: testProvisionView,
          [PRODUCT_PAGE]: productView,
        }, authenticatedView(user), action);
      } catch (err) {
        delete metadata.manifoldToken;
        await zeitClient.setMetadata(metadata);
        return unauthenticatedView(payload);
      }
    }

    return unauthenticatedView(payload);
  }
);
