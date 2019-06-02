import { parse as parseUrl } from 'url';
import cookie from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';

const { ZEIT_CLIENT_ID } = process.env;

export default function (req: IncomingMessage, res: ServerResponse): void {
  if (!req.url) {
    res.writeHead(500);
    return res.end('No url provided');
  }

  const { query } = parseUrl(req.url, true);
  const { next, code, state } = query;

  if (next) {
    const newState = `state_${Math.random()}`;
    const redirectUrl = `https://zeit.co/oauth/authorize?client_id=${ZEIT_CLIENT_ID}&state=${newState}`;
    const context = { next, state: newState };

    res.writeHead(302, {
      Location: redirectUrl,
      'Set-Cookie': cookie.serialize('manifold-context', JSON.stringify(context), { path: '/' }),
    });
  } else {
    const cookies = cookie.parse(req.headers.cookie);
    const context = JSON.parse(cookies['manifold-context'] || '{}');

    if (!code || !state) {
      res.writeHead(403);
      return res.end('No code or state found');
    }

    if (state !== context.state) {
      res.writeHead(403);
      return res.end('Invalid state');
    }

    res.writeHead(302, {
      Location: `${context.next}?code=${code}&state=${state}`,
      'Set-Cookie': cookie.serialize('manifold-context', '', { path: '/' }),
    });
  }
  return res.end('Redirecting...');
}
