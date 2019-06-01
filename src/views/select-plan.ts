import { htm, UiHookPayload } from '@zeit/integration-utils';

import { PROVISION } from '../constants';
import { Manifold } from '../api/manifold';

export default (_: Manifold, __: UiHookPayload) => () => htm`
<Page>
  <H2>Select Plan</H2>
  <Select>
    <Option value="free" caption="Free">Option</Option>
  </Select>
  <Button action="${PROVISION}">Provision<Button>
</Page>
`;
