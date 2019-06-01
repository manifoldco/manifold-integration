import { htm, UiHookPayload } from '@zeit/integration-utils';

import { Manifold } from '../api/manifold';

export default (_: Manifold, __: UiHookPayload) => () => htm`
    <Page>
      Test Provision View
    </Page>
`;
