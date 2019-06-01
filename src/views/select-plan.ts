import { htm } from '@zeit/integration-utils';
import { PROVISION } from '../constants';

export default () => htm`
<Page>
  <H2>Select Plan</H2>
  <Select>
    <Option value="free" caption="Free">Option</Option>
  </Select>
  <Button action="${PROVISION}">Provision<Button>
</Page>
`;
