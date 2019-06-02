import { htm } from '@zeit/integration-utils';

import { exportCredentials } from '../controllers/credentials';
import { RouteParams } from '../api/router';

export default async (attrs: RouteParams): Promise<string> => {
  const { client, params, zeitClient, payload } = attrs;

  if (!params) {
    return htm`
      <Page>
        <Notice type="error">Resource not found</Notice>
      </Page>
    `;
  }

  const resourceId = params[0];
  const resource = await client.getResourcesId(resourceId);

  if (resource.state === 'done') {
    await exportCredentials(payload, zeitClient, client, [resourceId]);

    return htm`
    <Page>
      Success!
      <AutoRefresh timeout="3000" action="${`resource-details-${resource.id}`}"/>
    </Page>
  `;
  }

  return htm`
    <Page>
      Provisioning...
      <AutoRefresh timeout="3000" action="${`operation-${resource.id}`}"/>
    </Page>
  `;
};
