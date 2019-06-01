import { htm } from '@zeit/integration-utils';
import { TEST_PROVISION } from '../constants';

export default (user: Manifold.User) => () => htm`
<Page>
  <Container>
    <Box display="flex" justifyContent="space-between">
      <H1>Manifold services</H1>
      <Button action="select-plan" small>+ Add a service</>
    </Box>
    <P>This is the list of service resources available for ${user.body.email}</P>
    <Fieldset>
      <FsContent>
      <Box display="flex">
        <Img src="https://cdn.manifold.co/providers/mailgun/logos/q922nwncyuw263chbg86e0rw1m.png" />
        <Box>
          <H2>Mailgun</H2>
        </Box>
      </Box>
      </FsContent>
    </Fieldset>
  </Container>

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
