import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';

export default async (attrs: RouteParams): Promise<string> => {
  const { client, params } = attrs;

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
