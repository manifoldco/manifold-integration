import { htm } from '@zeit/integration-utils';

export default (user: Manifold.User) => htm`
<Page>
  Welcome ${user.body.email}
  <BR/>
  <BR/>
  <BR/>
  <BR/>
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
      <Button action="test-provision">Provision Now</Button>
    </FsContent>
  </Fieldset>
</Page>
`;
