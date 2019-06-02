import { ZeitClient, UiHookPayload } from '@zeit/integration-utils';

import { Manifold } from '../api/manifold';

export const exportCredentials = async (
  payload: UiHookPayload,
  zeitClient: ZeitClient,
  manifoldClient: Manifold,
  resourceIds?: string[]
): Promise<void> => {
  const { projectId } = payload;
  // Can only sync credentials if within a project ID
  if (projectId) {
    const credentials = await manifoldClient.getCredentials(resourceIds);

    // Currently, all credentials will have their values merged if they have the same key, how do we want to handle that?
    let credentialsValuePair: {[s: string]: string} = {};
    credentials.forEach(cred => {
      credentialsValuePair = {
        ...credentialsValuePair,
        ...cred.body.values,
      };
    });

    Object.keys(credentialsValuePair).forEach(async (key: string) => {
      const value = credentialsValuePair[key];
      const secretName = await zeitClient.ensureSecret(`manifold_${key.toLowerCase()}`, value);
      await zeitClient.upsertEnv(projectId, key, secretName);
    });
  }
};

export const unexportCredentials = async (
  payload: UiHookPayload,
  zeitClient: ZeitClient,
  manifoldClient: Manifold,
  resourceIds?: string[]
): Promise<void> => {
  const { projectId } = payload;
  // Can only sync credentials if within a project ID
  if (projectId) {
    const credentials = await manifoldClient.getCredentials(resourceIds);

    let credentialsValuePair: {[s: string]: string} = {};
    credentials.forEach(cred => {
      credentialsValuePair = {
        ...credentialsValuePair,
        ...cred.body.values,
      };
    });

    Object.keys(credentialsValuePair).forEach(async (key: string) => {
      await zeitClient.removeEnv(projectId, key);
    });
  }
};
