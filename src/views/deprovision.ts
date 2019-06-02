import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';

export default (user: Manifold.User) => async (attrs: RouteParams): Promise<string> => {
  const { client, params } = attrs;

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

    return htm`
      <Page>
        Deprovisioning...
        <AutoRefresh timeout="3000" action="/home"/>
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
