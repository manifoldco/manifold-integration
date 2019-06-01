import { htm } from '@zeit/integration-utils';

export default (user: Manifold.User) => () => htm`
<Page>
  Welcome ${user.body.email}
  <Button action="test-provision">Test Provisions</Button>
  <Link action="product-elegant-cms">Elegant CMS - See More</Link>
</Page>
`;
