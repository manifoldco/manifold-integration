import { htm } from '@zeit/integration-utils';

import { unexportCredentials } from '../controllers/credentials';
import { RouteParams } from '../api/router';

export default (user: Manifold.User) => async (attrs: RouteParams): Promise<string> => {
  const { client, params, payload, zeitClient } = attrs;

  if (!params) {
    return htm`
      <Page>
        <Notice type="error">Resource not found</Notice>
      </Page>
    `;
  }

  const resourceId = params[0];

  if (!resourceId) {
    return htm`
      <Page>
        <Notice type="error">Missing resourceId</Notice>
      </Page>
    `;
  }

  try {
    await client.deprovisionResource(resourceId, user.id);
    await unexportCredentials(payload, zeitClient, client, [resourceId]);

    return htm`
      <Page>
        Deprovisioning...
        <AutoRefresh timeout="3000" action="discovery"/>
      </Page>
    `;
  } catch (e) {
    console.error('error', e);
    return htm`
      <Page>
        Failure ${e.message}
      </Page>
    `;
  }
};
