/* @flow */

import React, {Component, PropTypes} from 'react';

import path from 'path';

export class Paths {
  static head(path: string): string {
    if (path[0] === '/') path = path.substring(1);
    let index = path.indexOf('/');
    return decodeURI(path.substring(0, index < 0 ? path.length : index));
  }
  static tail(path: string): string {
    if (path[0] === '/') path = path.substring(1);
    let index = path.indexOf('/');
    return decodeURI(path.substring(index < 0 ? path.length: index + 1));
  }
  static last(path: string): string {
    if (path[0] === '/') path = path.substring(1);
    let index = path.lastIndexOf('/');
    return decodeURI(path.substring(index < 0 ? path.length: index + 1));
  }
  static split(path: string): Array<string> {
    return path.split('/').filter(e => e.length).map(decodeURI);
  }
}

/**
 * API example:
 *
 * import React, {Component, PropTypes} from 'react';
 * import Drilldown, {Route, Paths, Link} from 'mindfront-react-components/common/Drilldown.jsx';
 *
 * class MyRoute extends Component {
 *   static propTypes = {
 *     // these will be passed in by Drilldown or Route:
 *     path: PropTypes.string.isRequired,    // the absolute path of the route that this component is rendering
 *     subpath: PropTypes.string.isRequired  // the subpath (relative to path) of the requested drilldown route
 *   };
 *   render() {
 *     let {path, subpath} = props;
 *
 *     let childPath = Paths.head(subpath);  // gets the first path element
 *
 *     return <Route childRoute={MyRoute} childPath={childPath}>
 *       The path of this route is: {path}
 *       <Link to="..">Back</Link>
 *     </Route>;
 *   }
 * };
 *
 * const drilldown = <Drilldown path="/some/path" root={MyRoute}/>;
 */

type LinkProps = {
  to: string,
  disabled?: boolean,
  children?: any,
  onClick?: (e: MouseEvent) => any,
};

export class Link extends Component<void,LinkProps,void> {
  static contextTypes = {
    drilldownRoute: PropTypes.any.isRequired,
  };
  render(): ReactElement {
    let {to, children, disabled, onClick} = this.props;
    let {drilldownRoute} = this.context;
    return <a href="" {...this.props} onClick={e => {
      if (onClick) onClick(e);
      e.preventDefault();
      if (!disabled) {
        drilldownRoute.navigateTo(to);
      }
    }}>
      {children}
    </a>;
  }
}

export type RouteProps = {
  className?: string,
  children?: any,        // the contents of this route to display
  childRoute?: ReactTag, // the element type that will be used to render the active child of this route, if any
  childPath?: string     // the path of the child route, if any (relative to this route's path)
};

export class Route extends Component<void,RouteProps,void> {
  static contextTypes = {
    RouteSkin: PropTypes.any.isRequired,
    drilldown: PropTypes.any.isRequired,
    drilldownRoutePath: PropTypes.string.isRequired,
    drilldownRouteDepth: PropTypes.number.isRequired
  };
  static childContextTypes = {
    drilldownRoute: PropTypes.any.isRequired,
    drilldownRoutePath: PropTypes.string,
    drilldownRouteDepth: PropTypes.number
  };
  getDepth(): number {
    return this.context.drilldownRouteDepth;
  }
  getPath(): string {
    return this.context.drilldownRoutePath;
  }
  getChildPath(): string {
    let {childPath} = this.props;
    if (childPath) {
      return path.normalize(this.getPath() + '/' + childPath);
    }
    throw new Error('getChildPath() is not applicable without a childPath prop');
  }
  navigateTo(toPath: string): void {
    let absPath = path.normalize(path.isAbsolute(toPath) ? toPath : this.getPath() + '/' + toPath);
    this.context.drilldown.navigateTo(absPath);
  }
  getChildContext(): Object {
    let {childPath} = this.props;
    let result: Object = {drilldownRoute: this};
    if (childPath) {
      result.drilldownRoutePath = this.getChildPath();
      result.drilldownRouteDepth = this.getDepth() + 1;
    }
    return result;
  }
  render(): ReactElement {
    let {RouteSkin} = this.context;
    return <RouteSkin {...this.props}/>;
  }
}

export type DefaultProps = {
  path: string,
  onPathChange: (newPath: string) => any
};

export type Props = DefaultProps & {
  className?: string,
  root?: ReactTag
};

export default class Drilldown extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    path: '/',
    onPathChange() {},
  };
  static contextTypes = {
    DrilldownSkin: PropTypes.any.isRequired
  };
  static childContextTypes = {
    LinkSkin: PropTypes.any.isRequired,
    drilldown: PropTypes.any.isRequired,
    drilldownRoutePath: PropTypes.string.isRequired,
    drilldownRouteDepth: PropTypes.number.isRequired
  };
  getChildContext(): Object {
    return {
      LinkSkin: Link,
      drilldown: this,
      drilldownRoutePath: '/',
      drilldownRouteDepth: 0
    };
  }
  navigateTo: (toPath: string) => void = (toPath) => {
    let newPath = path.normalize(path.isAbsolute(toPath) ? toPath : path.join(this.props.path, toPath));
    this.props.onPathChange(newPath);
  };
  render(): ReactElement {
    let {DrilldownSkin} = this.context;
    return <DrilldownSkin {...this.props}/>;
  }
}
