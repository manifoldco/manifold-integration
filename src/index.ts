import { withUiHook } from '@zeit/integration-utils';

import { completeOAuth } from './controllers/zeitOAuth';
import authenticatedView from './views/authenticated';
import unauthenticatedView from './views/unauthenticated';
import testProvisionView from './views/test-provision';
import { Manifold } from './api/manifold';
import error from './views/error';

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

        switch (action) {
          case 'test-provision':
            return testProvisionView();
          default:
            return authenticatedView(user);
        }
      } catch (err) {
        delete metadata.manifoldToken;
        zeitClient.setMetadata(metadata);
        return unauthenticatedView(payload);
      }
    }

    return unauthenticatedView(payload);
  }
);
