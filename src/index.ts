import { withUiHook } from '@zeit/integration-utils';

import { completeOAuth } from './controllers/zeitOAuth';
import authenticatedView from './views/authenticated';
import unauthenticatedView from './views/unauthenticated';
import productView from './views/product';
import selectProductView from './views/select-product';
import testProvisionView from './views/test-provision';
import resourceDetailsView from './views/resource-detail';
import { TEST_PROVISION, PRODUCT_PAGE, RESOURCE_DETAILS, SELECT_PRODUCT } from './constants';
import { Manifold } from './api/manifold';
import error from './views/error';
import { Router } from './api/router';

const { MANIFOLD_IDENTITY_URL, MANIFOLD_MARKETPLACE_URL, MANIFOLD_CONNECTOR_URL } = process.env;

export default withUiHook(
  async ({ zeitClient, payload }): Promise<string> => {
    let metadata = await zeitClient.getMetadata();
    const { action /* , projectId */ } = payload;

    if (!MANIFOLD_IDENTITY_URL || !MANIFOLD_MARKETPLACE_URL || !MANIFOLD_CONNECTOR_URL) {
      return error('500', 'Missing configuration in the integration.');
    }

    const client = new Manifold({
      identityUrl: MANIFOLD_IDENTITY_URL,
      marketplaceUrl: MANIFOLD_MARKETPLACE_URL,
      connectorUrl: MANIFOLD_CONNECTOR_URL,
      bearerToken: metadata.manifoldToken,
    });

    if (!metadata.manifoldToken && payload.query.code) {
      await completeOAuth(payload, zeitClient, client, metadata);
      metadata = await zeitClient.getMetadata();
      client.bearerToken = metadata.manifoldToken;
    }

    if (metadata.manifoldToken) {
      try {
        // Let's try to make this "are we logged in" check smarter
        await client.getSelf();

        return new Router({
          routes: {
            [PRODUCT_PAGE]: productView,
            [RESOURCE_DETAILS]: resourceDetailsView,
            [SELECT_PRODUCT]: selectProductView,
            [TEST_PROVISION]: testProvisionView,
          },
          client,
          payload,
          zeitClient,
        }).route(action, authenticatedView);
      } catch (err) {
        console.error('error', err);
        delete metadata.manifoldToken;
        await zeitClient.setMetadata(metadata);
        return unauthenticatedView(payload);
      }
    }

    return unauthenticatedView(payload);
  }
);
