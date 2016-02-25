/* @flow */

import path from 'path';

export function getPathParts(strpath: string): Array<string> {
  return strpath === '/' ? [''] : path.normalize(strpath).split('/').map(decodeURIComponent);
}

export class DrilldownRoute {
  getComponent(): ReactTag {
    return 'div';
  }
  getChild(key: string): ?DrilldownRoute {
    return undefined;
  }
  childAtPath(path: string): ?DrilldownRoute {
    let parts = getPathParts(path);
    let route = this;
    for (let i = parts[0] === '' ? 1 : 0; i < parts.length && route; i++) {
      route = route.getChild(parts[i]);
    }
    return route;
  }
}
