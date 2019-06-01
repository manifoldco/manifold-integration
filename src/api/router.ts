export type RouteHandler = (action: string, params: string[]) => string;

export const router = (routes: {[s: string]: RouteHandler;}, def: RouteHandler, action: string): string => {
  const route = Object.keys(routes).find((key: string): boolean => new RegExp(key).test(action));

  if (!route) {
    return def(action, []);
  }

  const matches = action.match(new RegExp(route));
  if (!matches) {
    return routes[route](action, []);
  }

  return routes[route](action, [...matches.splice(1)]);
};
