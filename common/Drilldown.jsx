/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import path from 'path';

import {DrilldownRoute} from './DrilldownModel.jsx';
import DefaultDrilldownSkin from './DefaultDrilldownSkin.jsx';

type LinkProps = {
  to: string,
  disabled?: boolean,
  children?: any,
  onClick?: (e: MouseEvent) => any,
};

export class Link extends Component<void,LinkProps,void> {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
    path: PropTypes.any.isRequired,
  };
  render(): ReactElement {
    let {to, children, disabled, onClick} = this.props;
    let {drilldown: {navigate}} = this.context;
    return <a href="" {...this.props} onClick={e => {
      if (onClick) onClick(e);
      e.preventDefault();
      if (!disabled) {
        navigate(path.join(this.context.path, to));
      }
    }}>
      {children}
    </a>;
  }
}

type RouteProps = {
  path?: string,
  component?: any,
  children?: any,
};

export class Route extends Component<void,RouteProps,void> {
  render(): ReactElement {
    return <span {...this.props}/>;
  }
}

class ReactElementRoute extends DrilldownRoute {
  element: ReactElement;
  hasKeyedChildren: boolean = false;
  keyedChildren: {[key: any]: ReactElement} = {};
  constructor(element: ReactElement) {
    super();
    this.element = element;
  }
  getComponent(): any {
    return this.element.props.component;
  }
  getChild(key: string): ?DrilldownRoute {
    if (!this.hasKeyedChildren) {
      this.hasKeyedChildren = true;
      Children.forEach(this.element.props.children, (child: ReactElement) => {
        if (child.props.path) {
          this.keyedChildren[child.props.path] = child;
        }
      });
    }
    let child = this.keyedChildren[key];
    return child && new ReactElementRoute(child);
  }
}

export default class Drilldown extends Component {
  static contextTypes = {
    DrilldownSkin: PropTypes.any,
  };
  props: {
    className?: string,
    path: string,
    root?: DrilldownRoute,
    children?: any,
    skin?: any,
    onPathChange: (newPath: string) => any,
  };
  static defaultProps: {
    path: string,
    onPathChange: (newPath: string) => any,
  } = {
    path: '/',
    onPathChange() {},
  };
  static childContextTypes = {
    drilldown: PropTypes.any.isRequired,
    path: PropTypes.string.isRequired,
    LinkSkin: PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      LinkSkin: Link,
      drilldown: this,
      path: path.normalize(this.props.path),
    };
  }
  navigate: (toPath: string) => void = (toPath) => {
    let newPath = path.normalize(path.isAbsolute(toPath) ? toPath : path.join(this.props.path, toPath));
    this.props.onPathChange(newPath);
  };
  render(): ReactElement {
    let {root, children} = this.props;

    if (!root && children && React.isValidElement(children)) {
      root = new ReactElementRoute(children);
    }

    let DrilldownSkin = this.context.DrilldownSkin || this.props.skin || DefaultDrilldownSkin;
    return <DrilldownSkin {...this.props} root={root}/>;
  }
}
