import { RouteParams } from '../api/router';
import authenticated from './authenticated';
import error from './error';

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

    attrs.payload.clientState = { provisionName: p.name };

    return authenticated(attrs);
  } catch (e) {
    console.error('error', e);
    return error('500', e.message);
  }
};
