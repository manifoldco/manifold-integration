import { htm } from '@zeit/integration-utils';

import { DASHBOARD } from '../constants';
import { RouteParams } from '../api/router';
import products from '../data/products';

const { ROOT_URL } = process.env;

export default async (attrs: RouteParams): Promise<string> => {
  if (!attrs.params) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  const resourceId = attrs.params[0];
  const resource = await attrs.client.getResourcesId(resourceId);
  if (!resource) {
    return htm`
      <Page>
        <Notice type="error">Resource not found</Notice>
      </Page>
    `;
  }

  const product = products.find(
    (prod: Manifold.Product): boolean => prod.id === resource.body.product_id
  );
  if (!product) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  const plan = product.plans.find((p: Manifold.Plan): boolean => p.id === resource.body.plan_id);
  if (!plan) {
    return htm`
      <Page>
        <Notice type="error">Plan not found</Notice>
      </Page>
    `;
  }

  const ssoUrl = `${ROOT_URL}/sso/${resource.id}?authorization=${attrs.client.bearerToken}`;

  return htm`
    <Page>
      <Fieldset>
        <FsContent>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" justifyContent="stretch">
              <Box>
                <Img src="${product.logoUrl}" height="48" width="48"/>
              </Box>
              <Box marginLeft="1.5rem">
                <H1>${resource.body.name}</H1>
              </Box>
            </Box>
            <Box marginLeft="1.5rem">
              <Link href="${ssoUrl}" target="_blank">
               <Button secondary>Open ${product.name} Dashboard</Button>
              </Link>
            </Box>
          </Box>
          <Box borderTop="solid 1px gray" marginTop="1rem" marginBottom="1rem"/>
          <Box width="250px" marginRight="1rem" marginTop="1rem" textAlign="justified">
            <Fieldset>
              <FsContent>
                <H2>${plan.name}</H2>
                <P>${plan.cost} $</P>
                <Box borderTop="solid 1px gray" marginTop="1rem" marginBottom="1rem"/>
                <Box display="flex" flexDirection="column">
                  ${plan.features.map(feature => htm`
                    <Box marginTop="1rem" display="flex" justifyContent="space-between">
                      <B>${feature.name}</B>
                      <Box>${feature.valueName}</Box>
                    </Box>
                  `)}
                </Box>
              </FsContent>
            </Fieldset>
          </Box>
        </FsContent>
        <FsFooter>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box fontSize="14px">
              <Link action="${DASHBOARD}">← Back to my resources</Link>
            </Box>
            <Box marginLeft="1.5rem">
                <Button action="${`deprovision-${resourceId}`}" warning>Deprovision resource</Button>
            </Box>
          </Box>
        </FsFooter>
      </Fieldset>
    </Page>
`;
};
