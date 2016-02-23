/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';
import path from 'path';

const normalize = path.normalize.bind(path);

function pickBy(object, predicate) {
  let result = {};
  for (let key in object) {
    if (predicate(object[key], key, object)) {
      result[key] = object[key];
    }
  }
  return result;
}

import Fader from './Fader.jsx';
import PageSlider from './PageSlider.jsx';
import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Link} from './Drilldown.jsx';
import {DrilldownRoute, getPathParts} from './DrilldownModel.jsx';

import './DefaultDrilldownSkin.sass';

class DefaultDrilldownHeaderSkin extends Component {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
  };
  props: {
    className?: string,
    path: string,
    children?: any,
  };
  static defaultProps: {};
  render() {
    let {children} = this.props;
    let path = normalize(this.context.drilldown.props.path);

    return <div {...this.props}>
      <Link className="up-link" to=".." disabled={path === '/'}>
        <Glyphicon menuLeft float="left"/>
      </Link>
      {Children.count(children) === 1 && children && children.key !== undefined ?
        <Fader>{React.cloneElement(children, {key: path})}</Fader> :
        children}
    </div>;
  }
}

class DefaultDrilldownBodySkin extends Component {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
  };

  props: {
    className?: string,
    path: string,
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
    let nextPath = normalize(this.context.drilldown.props.path);
    if (nextPath !== this.targetPath) {
      this.targetPath = nextPath;
      let curPath  = this.renderedPath || '/';
      let shortPath = curPath.length < nextPath.length ? curPath : nextPath;
      let longPath  = curPath.length > nextPath.length ? curPath : nextPath;
      let pathContents = pickBy(this.state.pathContents, (value, path) => {
        return path.startsWith(shortPath) && longPath.startsWith(path);
      });
      pathContents[nextPath] = <div key={nextPath}>{nextProps.children}</div>;
      this.setState({pathContents});
    }
  }

  onTransitionEnd: Function = () => {
    this.renderedPath = this.targetPath = normalize(this.context.drilldown.props.path);
    let pathContents = {
      [this.renderedPath]: <div key={this.renderedPath}>{this.props.children}</div>
    };
    this.setState({pathContents});
  };

  render() {
    let {path} = this.context.drilldown.props;
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
    BodySkin:   PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      HeaderSkin: DefaultDrilldownHeaderSkin,
      BodySkin: DefaultDrilldownBodySkin,
    };
  }
  render(): ReactElement {
    let {path, root, className} = this.props;

    className = classNames(className, 'drilldown');

    let route = root.childAtPath(path);
    let Component:any = (route && route.getComponent()) || 'div';

    return <Component {...this.props} className={className} route={route}/>;
  }
}
