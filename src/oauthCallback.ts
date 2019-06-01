import { IncomingMessage, ServerResponse } from 'http'
import cookie from 'cookie';

export default function(req: IncomingMessage, res: ServerResponse): void {
    if (!req.url) {
        res.writeHead(500);
        return
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookies = cookie.parse(req.headers.cookie);
    const context = JSON.parse(cookies['manifold-context'] || '{}');

    if (!code || !state) {
        res.writeHead(403);
        res.end('No code or state found');
    }

    if (state !== context.state) {
        res.writeHead(403);
        res.end('Invalid state');
    }

    res.writeHead(302, {
        Location: `${context.next}?code=${code}`,
        'Set-Cookie': cookie.serialize('manifold-context', '', { path: '/' })
    });

    return res.end('Redirecting...');
};