import { htm } from '@zeit/integration-utils';
import { TEST_PROVISION, SELECT_PRODUCT } from '../constants';

export default (user: Manifold.User) => () => {
  console.log(user);

  return htm`
    <Page>
      <Box display="flex" justifyContent="space-between">
        <H1>Manifold services</H1>
        <Button action="${SELECT_PRODUCT}" small>+ Add a service</>
      </Box>
      <Box>
        📭 Services go here
      </Box>

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
      <Link action="product-elegant-cms">Elegant CMS - See More</Link>
    </Page>
  `;
};
