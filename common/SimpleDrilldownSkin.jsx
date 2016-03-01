/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import PageSlider from './PageSlider.jsx';
import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Link} from './Drilldown.jsx';
import {splitPath, joinPath} from './DrilldownModel.jsx';

import './SimpleDrilldownSkin.sass';

class PathContext extends Component {
  static childContextTypes = {
    path: PropTypes.string.isRequired,
  };
  getChildContext() {
    return {
      path: this.props.path,
    };
  }
  render() {
    let {children} = this.props;
    return React.isValidElement(children) ? children : <div>{children}</div>;
  }
}

class SimpleDrilldownTitleSkin extends Component {
  static contextTypes = {
    path: PropTypes.string.isRequired,
  };
  props: {
    children?: any,
  };
  static defaultProps: {};
  render() {
    let {children} = this.props;
    let {path} = this.context;

    return <h3 {...this.props}>
      {path === '/' ? undefined : <Link className="up-link" to="..">
        <Glyphicon menuLeft float="left"/>
      </Link>}
      {children}
    </h3>;
  }
}

export default class SimpleDrilldownSkin extends Component {
  state: {
    fromPath?: string
  } = {};
  static childContextTypes = {
    TitleSkin:  PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      TitleSkin: SimpleDrilldownTitleSkin,
    };
  }
  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.path !== this.props.path && this.props.path.startsWith(nextProps.path)) {
      this.setState({fromPath: this.props.path});
    }
  }
  onTransitionEnd: () => void = () => this.setState({fromPath: undefined});
  render(): ReactElement {
    let {path, root, className} = this.props;
    let {fromPath} = this.state;

    className = classNames(className, 'mf-simple-drilldown');

    let parts = splitPath(fromPath || path);
    let activeIndex = fromPath ? splitPath(path).length : parts.length;

    let route = root;

    let pages = [<PathContext path="/" key="/">
      {route.render({...this.props, path: '/', route})}
    </PathContext>];

    for (let i = 0; i < parts.length && route; i++) {
      route = route.getChild(parts[i]);
      if (!route) break;
      let partPath = joinPath(parts.slice(0, i + 1));
      pages.push(<PathContext path={partPath} key={partPath}>
        {route.render({...this.props, path, route})}
      </PathContext>);
    }

    return <div {...this.props} className={className}>
      <PageSlider activeIndex={activeIndex} onTransitionEnd={this.onTransitionEnd}>
        {pages}
      </PageSlider>
    </div>;
  }
}
