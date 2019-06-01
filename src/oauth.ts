import cookie from 'cookie';
import {IncomingMessage, ServerResponse} from "http";

const { ZEIT_CLIENT_ID } = process.env;

export default function(req: IncomingMessage, res: ServerResponse): void {
    if (!req.url) {
        res.writeHead(500);
        return
    }

    const url = new URL(req.url);
    const next = url.searchParams.get('next');
    const state = `state_${Math.random()}`;
    const redirectUrl = `https://zeit.co/oauth/authorize?client_id=${ZEIT_CLIENT_ID}&state=${state}`;
    const context = { next, state };

    res.writeHead(302, {
        Location: redirectUrl,
        'Set-Cookie': cookie.serialize('manifold-context', JSON.stringify(context), {path: '/'})
    });
    return res.end('Redirecting...');
};