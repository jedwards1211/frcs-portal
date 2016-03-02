/* @flow */

import React from 'react';
import path from 'path';

export function splitPath(strpath: string): Array<string> {
  if (strpath[0] === '/') strpath = strpath.substring(1);
  return strpath.length ? path.normalize(strpath).split('/').map(decodeURIComponent) : [];
}

export function joinPath(path: Array<string>): string {
  return path.length ? '/' + path.map(encodeURIComponent).join('/') : '/';
}

export class DrilldownRoute {
  getComponent(): ReactTag {
    return 'div';
  }
  render(props: Object): ?ReactElement {
    let Comp: any = this.getComponent();
    return <Comp {...props}/>;
  }
  getChild(key: string): ?DrilldownRoute {
    return undefined;
  }
  childAtPath(path: string): ?DrilldownRoute {
    let parts = splitPath(path);
    let route = this;
    for (let i = 0; i < parts.length && route; i++) {
      route = route.getChild(parts[i]);
    }
    return route;
  }
}
