import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';

import { Manifold } from '../api/manifold';

const {
  MANIFOLD_IDENTITY_URL,
  MANIFOLD_MARKETPLACE_URL,
  MANIFOLD_PROVISIONING_URL,
  MANIFOLD_CONNECTOR_URL,
} = process.env;

export default async function(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    res.writeHead(500);
    return res.end('No url provided');
  }

  if (
    !MANIFOLD_IDENTITY_URL ||
    !MANIFOLD_MARKETPLACE_URL ||
    !MANIFOLD_PROVISIONING_URL ||
    !MANIFOLD_CONNECTOR_URL
  ) {
    res.writeHead(500);
    return res.end('Missing configuration in the integration.');
  }

  const { query } = parseUrl(req.url, true);
  const { resource_id, authorization } = query;

  const client = new Manifold({
    identityUrl: MANIFOLD_IDENTITY_URL,
    marketplaceUrl: MANIFOLD_MARKETPLACE_URL,
    provisioningUrl: MANIFOLD_PROVISIONING_URL,
    connectorUrl: MANIFOLD_CONNECTOR_URL,
    bearerToken: authorization as string,
  });

  const authCode = await client.getSso(resource_id as string);

  res.writeHead(302, {
    Location: authCode.body.redirect_uri,
  });
  return res.end('Loading your resource dashboard');
}
