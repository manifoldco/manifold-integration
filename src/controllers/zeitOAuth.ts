import fetch from 'node-fetch';
import { ZeitClient, UiHookPayload } from "@zeit/integration-utils";

import { Metadata } from '../types';

const { MANIFOLD_OAUTH_URL } = process.env;

const oauthRoutes = {
    login: '/tokens/oauth',
    link: '/users/link/oauth:',
};

export const completeOAuth = async (payload: UiHookPayload, zeitClient: ZeitClient, metadata: Metadata) => {
    const response = await fetch(`${MANIFOLD_OAUTH_URL}${oauthRoutes.login}?code=${payload.query.code}&source=zeit`);

    if (response.status !== 201) {
        throw new Error(
            `Could not authenticate you on manifold: ${
                response.status
            } error: ${await response.text()}`
        );
    }

    const tokenInfo = await response.json();
    if (tokenInfo.error) {
        throw new Error(`Manifold OAuth issue: ${tokenInfo.error.message}`)
    }

    metadata.manifoldToken = tokenInfo;
    await zeitClient.setMetadata(metadata);
};