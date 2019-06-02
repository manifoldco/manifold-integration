import { htm } from '@zeit/integration-utils';
import { TEST_PROVISION, SELECT_PRODUCT } from '../constants';
import products from '../data/products';
import { $ } from '../utils/currency';

// TODO: replace with actual services
// Note: This was just a guess at Manifold.Resource; structure is flexible
const mockData: Manifold.Resource[] = [
  {
    name: 'messaging',
    plan: products[0].plans[0],
    product: products[0],
  },
  {
    name: 'logging',
    plan: products[5].plans[0],
    product: products[5],
  },
  {
    name: 'cms',
    plan: products[3].plans[0],
    product: products[3],
  },
];

export default (user: Manifold.User) => () => {
  console.log(user);

  return htm`
    <Page>
      <Box display="flex" justifyContent="space-between" marginBottom="1rem">
        <H1>Manifold services</H1>
        <Button action="${SELECT_PRODUCT}" small highlight>+ Add a new service</>
      </Box>
      ${mockData.map(
        ({ name, plan, product }) => htm`
        <Box marginBottom="1rem">
          <Fieldset>
            <FsContent>
              <Box display="flex" alignItems="center" paddingBottom="1rem" paddingLeft="0.15rem">
                <Box marginRight="0.5rem" width="10px" height="10px" display="block" background="linear-gradient(237deg, #00FF89 0%, #329DD1 100%)" borderRadius="50%"></Box>
                <H2>${name}</H2>
              </Box>
              <Box display="flex" align-items="center" justify-content="flex-start">
                <Box marginRight="0.5rem" borderRadius="3px" overflow="hidden" width="24px" height="24px">
                  <Img src="${product.logoUrl}" width="100%" height="auto"/>
                </Box>
                <Box marginRight="0.5rem">${product.name}</Box>
                <Box color="#737373">${plan.name} ${$(plan.cost)}/ mo</Box>
              </Box>
            </FsContent>
          </Fieldset>
        </Box>
      `
      )}

      <Fieldset>
        <FsContent>
          <H1>Provisioning test</H1>
        </FsContent>
        <FsContent>
          <FsTitle>Product</FsTitle>
            <FsSubtitle>Product you want to provision</FsSubtitle>
            <Select name="label" value="degraffdb-eight-ball-local">
              <Option value="degraffdb-eight-ball-local" caption="Degraffdb Eight balls" />
            </Select>
        </FsContent>
        <FsContent>
          <Button action="${TEST_PROVISION}">Provision Now</Button>
        </FsContent>
      </Fieldset>
    </Page>
  `;
};
