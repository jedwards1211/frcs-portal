/* @flow */

export default function createPath(options: {
  routes: {path?: string}[], 
  params: {[name: string]: string}, 
  endIndex?: number}): string
{
  const {routes, params} = options;
  const endIndex = options.endIndex || routes.length;
  let result = '';
  for (let i = 0; i < endIndex; i++) {
    const route = routes[i];
    if (route.path) {
      if (route.path[0] !== '/') {
        result += '/';
      }
      if (route.path[0] === ':') {
        result += params[route.path.substring(1)];
      }
      else {
        result += route.path;
      }
    } 
  } 
  return result;
}
