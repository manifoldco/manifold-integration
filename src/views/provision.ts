import { htm } from '@zeit/integration-utils';

import { dashify } from '../utils/dashify';
import { RouteParams } from '../api/router';
import { DASHBOARD } from '../constants';
import products from '../data/products';

const supportMsg = htm`Contact <B>support@manifold.co</B> if the problem persists.`;

export default (user: Manifold.User) => async (attrs: RouteParams): Promise<string> => {
  const { client, params, payload } = attrs;

  if (!params || !payload.projectId) {
    return htm`
      <Page>
        <Notice type="error">Invalid parameters. ${supportMsg}</Notice>
        <Box display="flex" justifyContent="center" marginTop="1rem">
          <Button action="${DASHBOARD}" secondary small>Back to dashboard</Link>
        </Box>
      </Page>
    `;
  }

  const productLabel = params[0];
  const product = products.find((prod: Manifold.Product): boolean => prod.label === productLabel);

  if (!product) {
    return htm`
      <Page>
        <Notice type="error">Product not found. ${supportMsg}</Notice>
        <Box display="flex" justifyContent="center" marginTop="1rem">
          <Button action="${DASHBOARD}" secondary small>Back to dashboard</Link>
        </Box>>
      </Page>
    `;
  }

  const { resourceName } = payload.clientState;

  try {
    const operation = {
      product_id: product.id,
      region_id: product.plans[0].regions[0],
      plan_id: product.plans[0].id,
    } as Manifold.Provision;

    if (resourceName) {
      operation.name = resourceName;
      operation.label = dashify(resourceName);
    }

    const provisionResult = await client.provisionProduct(
      operation,
      user.id,
      payload.configurationId,
      payload.projectId
    );

    return htm`
      <Page>
        <Notice type="message">
          Provisioning…
        </Notice>
        <AutoRefresh timeout="3000" action="${`operation-${provisionResult.resource_id}`}"/>
      </Page>
    `;
  } catch (e) {
    console.error('error', e);

    // View: invalid name
    if (e.message === 'bad_request: Invalid name') {
      return htm`
        <Page>
          <Notice type="error">
            Resource name must start with a letter and contain no spaces. Hyphens and underscores allowed (ex:
            <Box display="inline-block" fontFamily="Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace" fontWeight="700">my-resource</Box>
            or
            <Box display="inline-block" fontFamily="Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace" fontWeight="700">my_resource</Box>).
          </Notice>
          <Box display="flex" justifyContent="center" marginTop="1rem">
            <Button action="${`product-${product.label}`}" secondary small>← Back to product</Link>
          </Box>
        </Page>
      `;
    }

    return htm`
      <Page>
        <Notice type="error">
          ${`${e.message}.`} ${supportMsg}
        </Notice>
        <Box display="flex" justifyContent="center" marginTop="1rem">
          <Button action="${`product-${product.label}`}" secondary small>← Back to product</Link>
        </Box>
      </Page>
    `;
  }
};
