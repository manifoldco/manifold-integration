import { htm, UiHookPayload } from '@zeit/integration-utils';

import products from '../data/products';
import { Manifold } from '../api/manifold';

export default (_: Manifold, __: UiHookPayload) => (___: string, params: string[]) => {
  const product = products.find((prod: Manifold.Product) => prod.label === params[0]);

  if (!product) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  return htm`
    <Page>
      <Fieldset>
        <FsContent>
          <Box display="flex" justifyContent="stretch">
            <Box display="flex" justifyContent="stretch">
              <Img src="${product.logoUrl}" height="48" width="48"/>
            </Box>
            <Box marginLeft="1.5rem">
              <H1>${product.name}</H1>
              <P>${product.tagline}</P>
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" flexWrap="wrap" marginTop="2rem">
            ${product.valueProps.map(valueProp => htm`
              <Box width="31%" marginRight="1rem" marginTop="1rem" textAlign="justified">
                <H2>${valueProp.header}</H2>
                <P>${valueProp.body}</P>
              </Box>
            `)}
          </Box>
          <Box borderTop="solid 1px gray" marginTop="1rem" marginBottom="1rem"/>
          <Box display="flex" justifyContent="space-between" flexWrap="wrap">
            ${product.plans.map(plan => htm`
              <Box width="48%" marginRight="1rem" marginTop="1rem" textAlign="justified">
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
            `)}
          </Box>
        </FsContent>
        <FsFooter>
          <Button>Provision this product with Manifold</Button>
        </FsFooter>
      </Fieldset>
    </Page>
`;
};
