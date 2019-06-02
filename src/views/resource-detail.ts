import { htm } from '@zeit/integration-utils';

import { DASHBOARD } from '../constants';
import { RouteParams } from '../api/router';
import { $ } from '../utils/currency';
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

  const product = products.find((prod: Manifold.Product): boolean => prod.id === resource.body.product_id);
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
          <Box display="grid" gridColumnGap="1.5rem" gridTemplateColumns="25% auto">
            <Box paddingTop="1rem" alignItems="center" display="flex" flexDirection="column" textAlign="center">
              <Box borderRadius="0.375rem" width="72px" height="72px" overflow="hidden">
                <Img src="${product.logoUrl}" height="auto" width="100%"/>
              </Box>
              <P>${product.name}</P>
              <Link href="${ssoUrl}" target="_blank">
                <Button small>
                  Open Dashboard︎
                  <Box alignItems="center" display="inline-flex" fontSize="0.875em" height="1.375em" lineHeight="1" marginLeft="0.1em" justifyContent="center" width="1.375em">↗︎</Box>︎
                </Button>
              </Link>
            </Box>
            <Box>
              <H1>${resource.body.name}</H1>
              <Fieldset>
                <FsContent>
                  <Box fontSize="0.75rem" textTransform="uppercase" fontWeight="500" letterSpacing="1px" color="#777">
                    Plan
                  </Box>
                  <H2>
                    ${plan.name}
                    <Box display="inline" color="#777">${$(
                      plan.cost
                    )}<Box display="inline" marginLeft="-0.25em">/mo</Box></Box>
                  </H2>
                    ${plan.features.map(
                      (feature, index) => htm`
                      <Box backgroundColor="${
                        index % 2 === 0 ? '#fafafa' : 'transparent'
                      }" display="grid" gridTemplateColumns="1fr 1fr" padding="0.25rem" paddingTop="0.25rem">                        <B>${
                        feature.name
                      }</B>
                        <Box>${feature.valueName}</Box>
                      </Box>
                    `
                    )}
                </FsContent>
              </Fieldset>
            </Box>
          </Box>
        </FsContent>
        <FsFooter>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Box fontSize="14px" paddingLeft="0.5rem">
              <Link action="${DASHBOARD}">← Back to my resources</Link>
            </Box>
            <Box marginLeft="1.5rem">
              <Button action="${`deprovision-${resourceId}`}" warning small>Delete resource</Button>
            </Box>
          </Box>
        </FsFooter>
      </Fieldset>
    </Page>
`;
};
