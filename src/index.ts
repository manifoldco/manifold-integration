import { withUiHook, htm as html } from '@zeit/integration-utils';

import { completeOAuth } from './controllers/zeitOAuth';

export default withUiHook(async ({ zeitClient, payload }): Promise<string> => {
  let metadata = await zeitClient.getMetadata();
  // const { action, projectId } = payload;

  if (!metadata.manifoldToken && payload.query.code) {
    await completeOAuth(payload, zeitClient, metadata);
    metadata = await zeitClient.getMetadata();
  }

  if (metadata.manifoldToken) {
    return html`
      <Page>
          Logged in with oauth on Manifold
      </Page>
    `;
  }

  return html`
    <Page>
      You are not logged in... What?
    </Page>
  `;
});
