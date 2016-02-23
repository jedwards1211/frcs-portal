/* @flow */

export class DrilldownRoute {
  getComponent(): any {
    return 'div';
  }
  getHeaderComponent(): any {
    return 'div';
  }
  getChild(key: string): ?DrilldownRoute {
    return undefined;
  }
}
