import { htm } from '@zeit/integration-utils';
import { RouteParams } from '../api/router';

export default async (attrs: RouteParams) => {
  const { client } = attrs;
  try {
    const user = await client.getSelf();
    const p = {
      name: `some-name-${Date.now()}`,
      productId: '234j94djrwxapnnbyqbjtg75g111j',
      regionId: '235mhkk15ky7ha9qpu4gazrqjt2gr',
      planId: '2358ankfjp8k1zpau7ayphbfmhfzr',
      features: {
        crackers: true,
        juice: 50,
        sandwich: 'free',
      },
    } as Manifold.Provision;
    await client.provisionProduct(p, user.id);

    const resources = await client.getResources();
    console.log('resources', resources);

    return htm`
      <Page>
        Success!
        ${resources.map(
          r =>
            htm`
    ${r.body.name} - ${r.product.name}
      <BR/>
              `
        )}
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
