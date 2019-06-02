import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';
import products from '../data/products';

export default (user: Manifold.User) => async (attrs: RouteParams): Promise<string> => {
  const { client, params, payload } = attrs;

  if (!params || !payload.projectId) {
    return htm`
      <Page>
        <Notice type="error">Invalid parameters</Notice>
      </Page>
    `;
  }

  const productLabel = params[0];
  const product = products.find((prod: Manifold.Product): boolean => prod.label === productLabel);

  if (!product) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  try {
    const operation = {
      product_id: product.id,
      region_id: product.plans[0].regions[0],
      plan_id: product.plans[0].id,
    } as Manifold.Provision;

    const provisionResult = await client.provisionProduct(
      operation,
      user.id,
      payload.configurationId,
      payload.projectId
    );

    return htm`
      <Page>
        Provisioning...
        <AutoRefresh timeout="3000" action="${`operation-${provisionResult.resource_id}`}"/>
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
