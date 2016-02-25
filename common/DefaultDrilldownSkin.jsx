/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import path from 'path';

import Fader from './Fader.jsx';
import PageSlider from './PageSlider.jsx';
import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Link} from './Drilldown.jsx';
import {DrilldownRoute, getPathParts} from './DrilldownModel.jsx';

import './DefaultDrilldownSkin.sass';

function pickBy(object, predicate) {
  let result = {};
  for (let key in object) {
    if (predicate(object[key], key, object)) {
      result[key] = object[key];
    }
  }
  return result;
}

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

class DefaultDrilldownTitleSkin extends Component {
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

class DefaultDrilldownHeaderFooterSkin extends Component {
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

    return <div {...this.props}>
      {children && React.isValidElement(children) ?
        <Fader>
          <PathContext key={children.key || path} path={path}>
            {children}
          </PathContext>
        </Fader> :
        children}
    </div>;
  }
}

class DefaultDrilldownBodySkin extends Component {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
    path: PropTypes.string.isRequired,
  };

  props: {
    className?: string,
    root: DrilldownRoute,
    children?: any,
  };

  defaultProps: {};

  state: {
    pathContents: Object,
  } = {
    pathContents: {},
  };

  renderedPath: ?string;
  targetPath: ?string;

  componentWillMount() {
    this.onTransitionEnd();
  }

  componentWillReceiveProps(nextProps: Object) {
    let nextPath = this.context.drilldown.props.path;
    if (nextPath !== this.targetPath) {
      this.targetPath = nextPath;
      let curPath  = this.renderedPath || '/';
      let shortPath = curPath.length < nextPath.length ? curPath : nextPath;
      let longPath  = curPath.length > nextPath.length ? curPath : nextPath;
      let pathContents = pickBy(this.state.pathContents, (value, path) => {
        return path.startsWith(shortPath) && longPath.startsWith(path);
      });
      pathContents[nextPath] = <PathContext key={nextPath} path={nextPath}>
        {nextProps.children}
      </PathContext>;
      this.setState({pathContents});
    }
  }

  onTransitionEnd: Function = () => {
    this.renderedPath = this.targetPath = this.context.path;
    let pathContents = {
      [this.renderedPath]: <PathContext key={this.renderedPath} path={this.renderedPath}>
        {this.props.children}
      </PathContext>
    };
    this.setState({pathContents});
  };

  render() {
    let {path} = this.context;
    let {pathContents} = this.state;

    let pathParts = getPathParts(path);
    let activeIndex = pathParts.length - 1;

    let pages = [];

    for (let otherPath in pathContents) {
      let index = getPathParts(otherPath).length - 1;
      pages[index] = pathContents[otherPath];
    }
    for (let i = 0; i < pages.length && !pages[i]; i++) {
      pages[i] = <div key={i}/>;
    }

    return <PageSlider {...this.props} activeIndex={activeIndex}
                                       onTransitionEnd={this.onTransitionEnd}>
      {pages}
    </PageSlider>;
  }
}

export default class DefaultDrilldownSkin extends Component {
  static childContextTypes = {
    HeaderSkin: PropTypes.any.isRequired,
    TitleSkin:  PropTypes.any.isRequired,
    BodySkin:   PropTypes.any.isRequired,
    FooterSkin: PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      HeaderSkin: DefaultDrilldownHeaderFooterSkin,
      TitleSkin: DefaultDrilldownTitleSkin,
      BodySkin: DefaultDrilldownBodySkin,
      FooterSkin: DefaultDrilldownHeaderFooterSkin,
    };
  }
  render(): ReactElement {
    let {path, root, className} = this.props;

    className = classNames(className, 'drilldown');

    let route = root.childAtPath(path);
    let Component:any = (route && route.getComponent()) || 'div';

    return <Component {...this.props} className={className} path={path} route={route}/>;
  }
}
