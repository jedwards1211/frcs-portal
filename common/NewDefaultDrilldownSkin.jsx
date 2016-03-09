/* @flow */

import React, {Component, PropTypes} from 'react';
import {createSelector} from 'reselect';
import classNames from 'classnames';

import Glyphicon from '../bootstrap/Glyphicon.jsx';

import setStateChain from '../utils/setStateChain';
import paddingHeight from '../utils/paddingHeight';
import {getTimeout} from '../transition/callOnTransitionEnd';

import {TICK} from '../transition/animConstants';

import {Link} from './NewDrilldown.jsx';
import type {Props, DefaultProps, RouteProps} from './NewDrilldown.jsx';

import createOrCloneElement from '../utils/createOrCloneElement';

import './NewDefaultDrilldownSkin.sass';

export class DefaultDrilldownTitleSkin extends Component {
  static contextTypes = {
    drilldownRoute: PropTypes.any.isRequired,
  };
  props: {
    children?: any,
  };
  static defaultProps: {};
  render(): ReactElement {
    let {children} = this.props;
    let {drilldownRoute} = this.context;
    let parentPath = drilldownRoute.getParentPath();

    return <h3 {...this.props}>
      {parentPath && <Link className="up-link" to={parentPath}>
        <Glyphicon menuLeft float="left"/>
      </Link>}
      {children}
    </h3>;
  }
}

export class DefaultDrilldownRouteSkin extends Component<void,RouteProps,void> {
  content: ?HTMLElement;
  static contextTypes = {
    drilldownSkin: PropTypes.any.isRequired,
    drilldownRoute: PropTypes.any.isRequired,
  };
  static childContextTypes = {
    TitleSkin: PropTypes.any.isRequired
  };
  getChildContext(): Object {
    return {
      TitleSkin: DefaultDrilldownTitleSkin
    };
  }
  getPath(): string {
    return this.context.drilldownRoute.getPath();
  }
  getDepth(): number {
    return this.context.drilldownRoute.getDepth();
  }
  getChildSubpath(): string {
    let {drilldownSkin: {state: {mountedPath}}, drilldownRoute} = this.context;
    return mountedPath.substring(drilldownRoute.getChildPath().length);
  }
  componentDidMount(): void {
    this.context.drilldownSkin.routeDidMount(this);
  }
  componentWillUnmount(): void {
    this.context.drilldownSkin.routeWillUnmount(this);
  }
  render(): ReactElement {
    let {className, children, childRoute} = this.props;
    let {drilldownSkin, drilldownRoute} = this.context;
    let {transitioning} = drilldownSkin.state;

    let visible = transitioning || this.getPath() === drilldownSkin.getActivePath();

    className = classNames(className, 'mf-default-drilldown-route');
    let contentStyle = Object.assign({
      visibility: visible ? 'visible' : 'hidden',
      height: visible ? undefined : 0
    });

    return <div {...this.props} className={className}>
      {children && <div className="mf-default-drilldown-route-content" ref={c => this.content = c} style={contentStyle}>
        {children}
      </div>}
      {childRoute && <div className="mf-default-drilldown-route-child"
                          key={drilldownRoute.getChildPath()}>
        {createOrCloneElement(childRoute, {
          path: drilldownRoute.getChildPath(),
          subpath: this.getChildSubpath()
        })}
      </div>}
    </div>;
  }
}

type State = {
  path: string,
  mountedPath: string,
  transitioning: boolean,
  height?: number,
  routes: {[path: string]: ?DefaultDrilldownRouteSkin}
};

type ExtraProps = {
  style: Object
};

export default class DefaultDrilldownSkin extends Component<DefaultProps,Props & ExtraProps,State> {
  mounted: boolean = false;
  root: ?HTMLElement;
  viewport: ?HTMLElement;
  transitioning: boolean = false;
  forceUpdateRoutes: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      path: props.path,
      mountedPath: props.path,
      transitioning: false,
      height: undefined,
      routes: {}
    };
  }

  static childContextTypes = {
    drilldownSkin: PropTypes.any.isRequired,
    RouteSkin: PropTypes.any.isRequired
  };
  getChildContext(): Object {
    return {
      drilldownSkin: this,
      RouteSkin: DefaultDrilldownRouteSkin,
    };
  }
  componentWillReceiveProps(nextProps: Props): void {
    if (this.props.path !== nextProps.path) {
      this.doTransition(nextProps.path);
    }
  }
  componentWillMount(): void {
    this.mounted = true;
  }
  componentWillUnmount(): void {
    this.mounted = false;
  }
  isMounted(): boolean {
    return this.mounted;
  }
  routeDidMount: (route: DefaultDrilldownRouteSkin) => void = route => {
    setTimeout(() => this.setState({
      routes: Object.assign({}, this.state.routes, {
        [route.getPath()]: route
      })
    }), 0);
  };
  routeWillUnmount: (route: DefaultDrilldownRouteSkin) => void = route => {
    setTimeout(() => this.setState({
      routes: Object.assign({}, this.state.routes, {
        [route.getPath()]: undefined
      })
    }), 0);
  };
  doTransition: (nextPath?: string) => boolean = (nextPath = this.props.path) => {
    let {state: {path}} = this;

    if (nextPath === path || this.transitioning) return false;
    this.transitioning = true;

    function scrollHeight(route: ?DefaultDrilldownRouteSkin): number {
      return route && route.content ? route.content.scrollHeight : 0;
    }

    let sequence = [
      cb => ({
        height: scrollHeight(this.state.routes[path]) + paddingHeight(this.root),
        mountedPath: nextPath.startsWith(path) ? nextPath : path
      }),
      cb => ({transitioning: true}),
      cb => ({
        path: nextPath,
        height: scrollHeight(this.state.routes[nextPath]) + paddingHeight(this.root)
      }),
      cb => setTimeout(cb, Math.max(TICK, getTimeout(this.viewport) || 0, getTimeout(this.root) || 0)),
      cb => ({transitioning: false}),
      cb => ({height: undefined, mountedPath: nextPath})
    ];

    setStateChain(this, sequence, err => {
      this.transitioning = false;
      this.doTransition();
    });
    return true;
  };

  selectActiveDepth: (state: State) => number = createSelector(
    state => state.path,
    state => state.routes,
    (path, routes) => {
      let route = routes[path];
      if (route) return route.getDepth();
      let depth = 0;
      for (let key in routes) {
        if (routes[key] && path.startsWith(key)) {
          depth = Math.max(depth, routes[key].getDepth());
        }
      }
      return depth;
    }
  );
  getActiveDepth(): number { return this.selectActiveDepth(this.state); }

  selectActivePath: (state: State) => string = createSelector(
    state => state.path,
    state => state.routes,
    (path, routes) => {
      let route = routes[path];
      if (route) return path;
      let activePath = '';
      for (let key in routes) {
        if (routes[key] && path.startsWith(key)) {
          activePath = key.length > activePath.length ? key : activePath;
        }
      }
      return activePath;
    }
  );
  getActivePath(): string { return this.selectActivePath(this.state); }

  componentWillUpdate(nextProps: Props, nextState: State): void {
    this.forceUpdateRoutes = nextState.transitioning !== this.state.transitioning ||
        this.selectActivePath(nextState) !== this.selectActivePath(this.state);
  }

  componentDidUpdate(): void {
    if (this.forceUpdateRoutes) {
      let {routes} = this.state;
      for (var key in routes) {
        if (routes[key]) routes[key].forceUpdate();
      }
    }
  }

  render(): ReactElement {
    let {className, style, rootRoute} = this.props;
    let {height, mountedPath} = this.state;

    className = classNames(className, 'mf-default-drilldown');
    style = Object.assign({}, style, {height});

    let transform = `translateX(${this.getActiveDepth() * -100}%)`;

    return <div {...this.props} className={className} style={style} ref={c => this.root = c}>
      <div className="mf-default-drilldown-viewport" ref={c => this.viewport = c}
           style={{
             'WebkitTransform': transform,
             'KhtmlTransform': transform,
             'MozTransform': transform,
             'msTransform': transform,
             'OTransform': transform,
             transform
           }}>
        {createOrCloneElement(rootRoute, {
          path: '/',
          subpath: mountedPath
        })}
      </div>
    </div>;
  }
}
