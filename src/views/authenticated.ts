import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';
import { SELECT_PRODUCT } from '../constants';
import products from '../data/products';
import { $ } from '../utils/currency';

export default async (attrs: RouteParams): Promise<string> => {
  const resources = await attrs.client.getResources();

  const { provisionName } = attrs.payload.clientState;

  let notice = '';
  if (provisionName) {
    notice = htm`<Notice type="success">Service ${provisionName} provisioned.</Notice>`;
  }

  return htm`
    <Page>
      ${notice}
      <Box display="flex" justifyContent="space-between" marginBottom="1rem">
        <H1>Manifold services</H1>
        <Button action="${SELECT_PRODUCT}" small highlight>+ Add a new service</Button>
      </Box>
      ${
        !resources.length
          ? htm`
        <Box marginBottom="1rem">
          <Notice message>
            You have no resource, yet. Go <Link action="${SELECT_PRODUCT}">provision one!</Link>
          </Notice>
        </Box>
      `
          : resources.map((resource: Manifold.Resource) => {
              const product = products.find(
                (prod: Manifold.Product): boolean => prod.id === resource.body.product_id
              );
              if (!product) {
                return '';
              }

              const plan = product.plans.find(
                (p: Manifold.Plan): boolean => p.id === resource.body.plan_id
              );
              if (!plan) {
                return '';
              }

              return htm`
          <Box marginBottom="1rem">
            <Fieldset>
              <FsContent>
                <Box display="flex" alignItems="center" paddingBottom="1rem" paddingLeft="0.15rem">
                  <Box marginRight="0.5rem" width="10px" height="10px" display="block" background="linear-gradient(237deg, #00FF89 0%, #329DD1 100%)" borderRadius="50%"></Box>
                  <H2>${resource.body.name}</H2>
                </Box>
                <Box display="flex" align-items="center" justify-content="flex-start">
                  <Box marginRight="0.5rem" borderRadius="3px" overflow="hidden" width="24px" height="24px">
                    <Img src="${product.logoUrl}" width="100%" height="auto"/>
                  </Box>
                  <Box marginRight="0.5rem">${product.name}</Box>
                  <Box color="#737373">${plan.name} ${$(plan.cost)}/ mo</Box>
                </Box>
              </FsContent>
              <FsFooter>
                <Button small action="${`resource-details-${resource.id}`}">View resource</Button>
              </FsFooter>
            </Fieldset>
          </Box>
        `;
            })
      }
    </Page>
  `;
};
