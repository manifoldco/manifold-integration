import { ZeitClient, UiHookPayload } from '@zeit/integration-utils';
import { Manifold } from './manifold';

export interface RouteParams {
  client: Manifold;
  zeitClient: ZeitClient;
  payload: UiHookPayload;
  action: string;
  params?: string[];
}

export type RouteHandler = (params: RouteParams) => string;

interface Config {
  client: Manifold;
  zeitClient: ZeitClient;
  payload: UiHookPayload;
  routes: {[s: string]: RouteHandler};
}

export class Router {
  manifoldClient: Manifold;
  zeitClient: ZeitClient;
  zeitPayload: UiHookPayload;
  routes: {[s: string]: RouteHandler};

  constructor(config: Config) {
    this.manifoldClient = config.client;
    this.zeitClient = config.zeitClient;
    this.zeitPayload = config.payload;
    this.routes = config.routes;
  }

  route(action: string, def: RouteHandler) {
    const route = Object.keys(this.routes).find((key: string): boolean => new RegExp(key).test(action));

    if (!route) {
      return def({
        action,
        client: this.manifoldClient,
        payload: this.zeitPayload,
        zeitClient: this.zeitClient,
      });
    }

    const matches = action.match(new RegExp(route));
    if (!matches) {
      return this.routes[route]({
        action,
        client: this.manifoldClient,
        payload: this.zeitPayload,
        zeitClient: this.zeitClient,
      });
    }

    return this.routes[route]({
      action,
      params: [...matches.splice(1)],
      client: this.manifoldClient,
      payload: this.zeitPayload,
      zeitClient: this.zeitClient,
    });
  }
}
