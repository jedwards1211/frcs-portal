/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';
import path from 'path';

import {createSkin, createSkinComponent} from 'react-skin';

import Fader from './Fader.jsx';
import PageSlider from './PageSlider.jsx';
import Glyphicon from '../bootstrap/Glyphicon.jsx';
import type {DrilldownRoute} from './DrilldownModel.jsx';

import './Drilldown.sass';

export function getPathParts(strpath: string): Array<string> {
  return strpath === '/' ? [''] : path.normalize(strpath).split('/').map(decodeURIComponent);
}

type Props = {
  className?: string,
  path: string,
  root: ?DrilldownRoute,
  onPathChange: (newPath: string) => any,
};


class HeaderSkin extends Component {
  props: {
    className?: string,
    path: string,
    children?: any,
  };
  static defaultProps: {};
  render() {
    let {className, children, path} = this.props;
    className = classNames(className, 'mf-default-drilldown-header');

    return <div {...this.props} className={className}>
      {<Link className="up-link" to=".." disabled={path === '/'}><Glyphicon menuLeft float="left"/></Link>}
      {Children.count(children) === 1 && children.key !== undefined ? <Fader>{children}</Fader> : children}
    </div>;
  }
}

const TitleSkin = createSkinComponent('DrilldownTitle', {
  component: 'h3',
  className: 'mf-default-drilldown-title',
});

class BodySkin extends Component {
  props: {
    className?: string,
    path: string,
    root: DrilldownRoute,
  };
  defaultProps: {};
  state: {
    lastPath?: string,
  } = {};
  componentWillReceiveProps(nextProps: Object) {
    let curPath  = path.normalize(this.props.path);
    let nextPath = path.normalize(nextProps.path);
    if (nextPath !== curPath && curPath.startsWith(nextPath)) {
      let {lastPath} = this.state;
      if (!lastPath || !lastPath.startsWith(nextPath)) {
        this.setState({lastPath: curPath});
      }
    }
  }
  onTransitionEnd: Function = () => {
    this.setState({lastPath: undefined});
  };
  render() {
    let {className, root} = this.props;
    let {lastPath} = this.state;
    let pathParts = getPathParts(lastPath || this.props.path);
    let activeIndex = lastPath ? getPathParts(this.props.path).length - 1 : pathParts.length - 1;

    let pages = [];
    let route = root;
    for (let i = 0; i < pathParts.length && route; i++) {
      let Component = route.getComponent();
      let pagePath = pathParts.join('/');
      pages[i] = <Component key={pagePath} route={route} path={pagePath}/>;
      route = route.getChild(pathParts[i + 1]);
    }

    className = classNames(className, 'mf-default-drilldown-body');

    return <PageSlider {...this.props} className={className} activeIndex={activeIndex}
                                       onTransitionEnd={this.onTransitionEnd}>
      {pages}
    </PageSlider>;
  }
}

export default createSkin('DefaultDrilldownSkin', {
  Drilldown: createSkinComponent('Drilldown', {
    component: createSkin('DefaultDrilldownContentSkin', {
      Header: HeaderSkin,
      Title: TitleSkin,
      Body: BodySkin,
    }, {
      component: 'div',
      className: 'mf-default-drilldown',
    }),
  }),
});
