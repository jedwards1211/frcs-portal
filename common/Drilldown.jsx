/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import type {LeaveHook} from '../flowtypes/LeaveHook';

import createOrCloneElement from '../utils/createOrCloneElement';

import nodepath from 'path';

export class Paths {
  static head(path: string): string {
    let index = path.indexOf('/', 1);
    return index < 0 ? path : path.substring(0, index);
  }
  static tail(path: string): string {
    return nodepath.relative(Paths.head(path), path);
  }
  static split(path: string): Array<string> {
    return path.split('/').filter(e => e.length);
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
  to?: string,
  up?: number | boolean,
  disabled?: boolean,
  children?: any,
  onClick?: (e: MouseEvent) => any,
};

export class Link extends Component<void,LinkProps,void> {
  static contextTypes = {
    drilldownRoute: PropTypes.any.isRequired,
  };
  render(): ReactElement {
    let {to, up, children, disabled, onClick} = this.props;
    if (up === true) {
      up = 1;
    }

    let {drilldownRoute} = this.context;
    return <a href="" {...this.props} onClick={e => {
      if (onClick) onClick(e);
      e.preventDefault();
      if (!disabled) {
        if (to) {
          drilldownRoute.navigateTo(to);
        }
        else if (up) {
          drilldownRoute.navigateUp(up);
        }
      }
    }}>
      {children}
    </a>;
  }
}

export type RouteProps = {
  path: string,
  subpath?: string,
  className?: string,
  children?: any,      // the contents of this route to display
  childRoute?: any,    // (actually a ReactTag or ReactElement) to render the child route, if any
  childPath?: string,  // the path of the child route, if any (relative to this route's path)
};

export class Route extends Component<void,RouteProps,void> {
  leaveHooks: LeaveHook[] = [];
  static contextTypes = {
    RouteSkin: PropTypes.any.isRequired,
    drilldown: PropTypes.any.isRequired,
    drilldownRoute: PropTypes.any
  };
  static childContextTypes = {
    drilldownRoute: PropTypes.any.isRequired,
    addLeaveHook: PropTypes.func.isRequired,
    removeLeaveHook: PropTypes.func.isRequired
  };
  getChildContext(): Object {
    return {
      drilldownRoute: this,
      addLeaveHook: this.addLeaveHook,
      removeLeaveHook: this.removeLeaveHook
    };
  }
  addLeaveHook:    (hook: LeaveHook) => any = (hook) => this.leaveHooks.push(hook);
  removeLeaveHook: (hook: LeaveHook) => any = (hook) => this.leaveHooks.splice(this.leaveHooks.indexOf(hook), 1);
  componentDidMount(): void {
    this.context.drilldown.routeDidMount(this);
  }
  componentWillUnmount(): void {
    this.context.drilldown.routeWillUnmount(this);
  }
  getParentRoute(): ?Route {
    return this.context.drilldownRoute;
  }
  getDepth(): number {
    let {drilldownRoute} = this.context;
    return drilldownRoute ? drilldownRoute.getDepth() + 1 : 0;
  }
  /**
   * Navigates up the given number of levels (default: 1).  This is *not* necessarily the number of elements in the path
   * separated by slashes; for instance, a Route at / could have a childRoute at /device/ABCDEFGH with no intermediate
   * child at /device.  In that case, navigateUp() from the child route would go back to /.
   * @param levels
   */
  navigateUp(levels?: number = 1): void {
    let parentRoute = this;
    if (levels > 0) {
      for (let i = 0; i < levels && parentRoute; i++) {
        parentRoute = parentRoute.getParentRoute();
      }
      if (parentRoute) {
        this.navigateTo(parentRoute.props.path);
      }
      else {
        throw new Error("can't navigate up beyond the root route");
      }
    }
  }
  navigateTo(toPath: string): void {
    let absPath = nodepath.normalize(nodepath.isAbsolute(toPath) ? toPath : nodepath.resolve(this.props.path, toPath));
    this.context.drilldown.navigateTo(absPath);
  }
  render(): ReactElement {
    let {path, subpath, childRoute, childPath} = this.props;

    if (childRoute) {
      if (subpath) {
        if (childPath) {
          childPath = nodepath.resolve(path, childPath);
          let childSubPath = nodepath.relative(childPath, nodepath.resolve(path, subpath));
          childRoute = createOrCloneElement(childRoute, {
            path: childPath,
            subpath: childSubPath
          });
        }
      }
      else {
        childRoute = undefined;
      }
    }

    let {RouteSkin} = this.context;
    return <RouteSkin {...this.props} childRoute={childRoute} depth={this.getDepth()}/>;
  }
}

export type DefaultProps = {
  path: string,
  onPathChange: (newPath: string) => any
};

export type Props = DefaultProps & {
  className?: string,
  rootRoute?: any,
};

type State = {
  // this path is updated from props *only when* no leave hooks reject the path change.
  // Using the path from props, which changes and then changes back momentarily, would trigger unwanted transitions,
  // but using this path, which doesn't change when leave hooks reject the change, doesn't trigger transitions.
  path: string
};

export default class Drilldown extends Component<DefaultProps,Props,State> {
  mounted: boolean = false;
  transitioning: boolean = false;
  routes: {[path: string]: ?Route} = {};
  static defaultProps = {
    path: '/',
    onPathChange() {}
  };
  static contextTypes = {
    DrilldownSkin: PropTypes.any.isRequired,
    addLeaveHook: PropTypes.func,
    removeLeaveHook: PropTypes.func
  };
  static childContextTypes = {
    LinkSkin: PropTypes.any.isRequired,
    drilldown: PropTypes.any.isRequired
  };
  getChildContext(): Object {
    return {
      LinkSkin: Link,
      drilldown: this
    };
  }
  navigateTo: (toPath: string) => void = (toPath) => {
    let newPath = nodepath.normalize(nodepath.isAbsolute(toPath) ? toPath : nodepath.resolve(this.props.path, toPath));
    this.props.onPathChange(newPath);
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      path: props.path
    };
  }
  componentWillMount(): void {
    this.mounted = true;
  }
  componentDidMount(): void {
    let {addLeaveHook} = this.context;
    addLeaveHook && addLeaveHook(this.ancestorWillLeave);
  }
  componentWillUnmount(): void {
    this.mounted = false;
    let {removeLeaveHook} = this.context;
    removeLeaveHook && removeLeaveHook(this.ancestorWillLeave);
  }
  routeDidMount: (route: Route) => void = route => {
    this.routes[route.props.path] = route;
  };
  routeWillUnmount: (route: Route) => void = route => {
    delete this.routes[route.props.path];
  };
  ancestorWillLeave: (leave: Function) => ?boolean = leave => {
    let leaveHookRoutes = _.filter(this.routes, route => this.state.path.startsWith(route.props.path))
      .sort((a, b) => b.props.path.length - a.props.path.length);

    for (let route of leaveHookRoutes) {
      for (let leaveHook of route.leaveHooks) {
        if (leaveHook(leave) === false) {
          return false;
        }
      }
    }
  };
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.path !== this.props.path) {
      let leaveHookRoutes = _.filter(this.routes, route => this.state.path.startsWith(route.props.path) &&
        !nextProps.path.startsWith(route.props.path))
        .sort((a, b) => b.props.path.length - a.props.path.length);

      let canceled = false;

      const leave = () => {
        canceled && this.mounted && this.props.onPathChange(nextProps.path);
      };

      for (let route of leaveHookRoutes) {
        for (let leaveHook of route.leaveHooks) {
          if (leaveHook(leave) === false) {
            canceled = true;
            nextProps.onPathChange(this.state.path);
            return;
          }
        }
      }

      this.setState({path: nextProps.path});
    }
  }
  render(): ReactElement {
    let {className} = this.props;
    let {path} = this.state;
    className = classNames(className, 'mf-drilldown');
    let {DrilldownSkin} = this.context;
    return <DrilldownSkin {...this.props} className={className} path={path}/>;
  }
}
