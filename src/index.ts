import { withUiHook, htm as html } from '@zeit/integration-utils'

import { completeOAuth } from './controllers/zeitOAuth';

const { ROOT_URL } = process.env;

export default withUiHook(async ({ zeitClient, payload }): Promise<string> => {
    const metadata = await zeitClient.getMetadata();
    // const { action, projectId } = payload;

    if (!metadata.manifoldToken && payload.query.code) {
        await completeOAuth(payload, zeitClient, metadata);
    }

    if (metadata.manifoldToken) {
        return html`
			<Page>
				<P>
				    Logged in with oauth on Manifold
				</P>
			</Page>
		`;
    }

    const connectUrl = `${ROOT_URL}/login`;
    return html`
		<Page>
			<Link href=${connectUrl}>Register Your ZEIT account on Manifold</Link>
		</Page>
	`
});
