import { htm } from '@zeit/integration-utils';

export default () =>
  htm`
  <Page>

        <H2>Select a service</H2>

        <Button action="">Provision service</Button>

        <Fieldset>
          <FsContent>
            <H2>Select Plan</H2>
            <Select name="plan" value="selectedValue">
              <Option value="free" caption="Free — $0" />
            </Select>
          </FsContent>
          <FsFooter>
            <Button>Provision</Button>
          </FsFooter>
        </Fieldset>
  </Page>
`;
