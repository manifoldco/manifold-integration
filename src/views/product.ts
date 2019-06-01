import { htm } from '@zeit/integration-utils';

import products from '../data/products';

export default (_: string, params: string[]) => {
  console.log(params);
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
          <H2>${product.name}</H2>
          <P>${product.tagline}</P>
        </FsContent>
        <FsFooter>
          <Button>Provision this product with Manifold</Button>
        </FsFooter>
      </Fieldset>
    </Page>
`;
};
