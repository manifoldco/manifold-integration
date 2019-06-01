declare namespace ZEIT {
  interface UiHookPayload {
    action: string;
    clientState: any;
    installationUrl: string;
    projectId?: string | null;
    query: {
      [key: string]: string | number | string[];
    };
    slug: string;
    integrationId: string;
    configurationId: string;
    teamId: string | null;
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      profiles: any[];
    };
    team?: {
      id: string;
      slug: string;
      name: string;
      description: string;
    } | null;
  }
}
