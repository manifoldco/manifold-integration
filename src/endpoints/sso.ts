import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';

import { Manifold } from '../api/manifold';

const { MANIFOLD_SCHEME, MANIFOLD_HOST } = process.env;

export default async function(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    res.writeHead(500);
    return res.end('No url provided');
  }

  if (!MANIFOLD_SCHEME || !MANIFOLD_HOST) {
    res.writeHead(500);
    return res.end('Missing configuration in the integration.');
  }

  const { query } = parseUrl(req.url, true);
  const { resource_id, authorization } = query;

  const client = new Manifold({
    manifoldScheme: MANIFOLD_SCHEME,
    manifoldHost: MANIFOLD_HOST,
    bearerToken: authorization as string,
  });

  const authCode = await client.getSso(resource_id as string);

  res.writeHead(302, {
    Location: authCode.body.redirect_uri,
  });
  return res.end('Loading your resource dashboard');
}
