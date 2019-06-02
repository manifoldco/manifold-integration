import { htm } from '@zeit/integration-utils';
import { RouteParams } from '../api/router';

export default (user: Manifold.User) => async (attrs: RouteParams): Promise<string> => {
  const { client } = attrs;
  try {
    const p = {
      name: `some-name-${Date.now()}`,
      product_id: '234j94djrwxapnnbyqbjtg75g111j',
      region_id: '235mhkk15ky7ha9qpu4gazrqjt2gr',
      plan_id: '2358ankfjp8k1zpau7ayphbfmhfzr',
    } as Manifold.Provision;

    await client.provisionProduct(p, user.id);

    const resources = await client.getResources();

    return htm`
      <Page>
        Success!
        ${resources.map(r => htm` ${r.body.name} - ${r.product && r.product.name}<BR/>`)}
      </Page>
    `;
  } catch (e) {
    console.error('error', e);
    return htm`
      <Page>
        Failure ${e.message}
      </Page>
    `;
  }
};
