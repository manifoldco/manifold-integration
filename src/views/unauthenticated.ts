import { htm, UiHookPayload } from '@zeit/integration-utils';

const { ROOT_URL } = process.env;

export default (payload: UiHookPayload) => {
  const connectUrl = `https://${ROOT_URL}/login/oauth?next=${encodeURIComponent(payload.installationUrl)}`;

  return htm`
    <Page>
      <Link href=${connectUrl}>Connect With Manifold</Link>
    </Page>
  `;
};
