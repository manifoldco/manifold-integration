import { htm, UiHookPayload } from '@zeit/integration-utils';

const { ROOT_URL } = process.env;

export default (payload: UiHookPayload) => {
  const connectUrl = `https://${ROOT_URL}/login/oauth?next=${encodeURIComponent(
    payload.installationUrl
  )}`;

  return htm`
    <Page>
      <Box text-align="center" margin-top="4rem">
        <H1>Connect with your Manifold account</H1>
        <Link href="${connectUrl}">Connect with Manifold</Link>
      </Box>
    </Page>
  `;
};
