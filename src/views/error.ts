import { htm } from '@zeit/integration-utils';

export default (code: string, error: string) => htm`
  <Page>
    Error ${code}, ${error}
  </Page>
`;
