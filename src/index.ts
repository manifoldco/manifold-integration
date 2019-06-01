import { withUiHook } from '@zeit/integration-utils';

import { completeOAuth } from './controllers/zeitOAuth';
import authenticatedView from './views/authenticated';
import unauthenticatedView from './views/unauthenticated';
import testProvisionView from './views/test-provision';

export default withUiHook(
  async ({ zeitClient, payload }): Promise<string> => {
    let metadata = await zeitClient.getMetadata();
    const { action /* , projectId */ } = payload;

    if (!metadata.manifoldToken && payload.query.code) {
      await completeOAuth(payload, zeitClient, metadata);
      metadata = await zeitClient.getMetadata();
    }

    if (!metadata.manifoldToken) {
        return unauthenticatedView();
    }

    switch (action) {
      case "test-provision":
        return testProvisionView();
      default:
        return authenticatedView();
    }
  }
);
