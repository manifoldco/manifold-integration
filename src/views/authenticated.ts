import { htm } from '@zeit/integration-utils';

export default () => htm`
<Page>
  Logged in with oauth on Manifold
  <Button action="test-provision">Test Provisions</Button>
</Page>
`;
