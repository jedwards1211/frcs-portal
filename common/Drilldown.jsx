/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';
import path from 'path';

import {createSkinComponent} from 'react-skin';

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

type DefaultProps = {
  onPathChange: (newPath: string) => any,
};

type DefaultSkinState = {
  lastPath?: string,
};

export class DefaultDrilldownHeaderSkin extends Component {
  render() {
    let {className, children, path} = this.props;
    className = classNames(className, 'mf-default-drilldown-header');

    return <div {...this.props} className={className}>
      {<Link className="up-link" to=".." disabled={path === '/'}><Glyphicon menuLeft float="left"/></Link>}
      {Children.count(children) === 1 && children.key !== undefined ? <Fader>{children}</Fader> : children}
    </div>;
  }
}

const DefaultDrilldownTitleSkin = createSkinComponent('DrilldownTitle', {
  component: 'h3',
  className: 'mf-default-drilldown-title',
});

export class DefaultDrilldownSkin extends Component {
  static childContextTypes = {
    HeaderSkin: PropTypes.any.isRequired,
    TitleSkin:  PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      HeaderSkin: DefaultDrilldownHeaderSkin,
      TitleSkin:  DefaultDrilldownTitleSkin,
    };
  }
  props: Props;
  defaultProps: {};
  state: DefaultSkinState = {};
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
    let activeRoute;
    for (let i = 0; i < pathParts.length && route; i++) {
      let Component = route.getComponent();
      let pagePath = pathParts.join('/');
      pages[i] = <Component key={pagePath} route={route} path={pagePath}/>;
      if (i === activeIndex) {
        activeRoute = route;
      }
      route = route.getChild(pathParts[i + 1]);
    }

    let Header = activeRoute && activeRoute.getHeaderComponent();

    className = classNames(className, 'mf-default-drilldown');

    return <div {...this.props} className={className}>
      {Header ?
        <Header route={activeRoute} path={this.props.path}/>
        : <span key="none"/>}
      <PageSlider activeIndex={activeIndex} onTransitionEnd={this.onTransitionEnd}>
        {pages}
      </PageSlider>
    </div>;
  }
}

export class Link extends Component {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
  };
  props: {
    to: string,
    disabled?: boolean,
    children: ReactElement,
  };
  static defaultProps: {};
  render(): ReactElement {
    let {to, children, disabled} = this.props;
    let {drilldown: {navigate}} = this.context;
    return <a href="" {...this.props} onClick={e => {
      e.preventDefault();
      if (!disabled) {
        navigate(to);
      }
    }}>
      {children}
    </a>;
  }
}

export default class Drilldown extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    onPathChange() {},
  };
  static contextTypes = {
    DrilldownSkin: PropTypes.any.isRequired,
  };
  static childContextTypes = {
    drilldown: PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return { drilldown: this };
  }
  navigate: (toPath: string) => void = (toPath) => {
    let newPath = path.normalize(path.join(this.props.path, toPath));
    this.props.onPathChange(newPath);
  };
  render(): ReactElement {
    let DrilldownSkin = this.context.DrilldownSkin || DefaultDrilldownSkin;
    return <DrilldownSkin {...this.props}/>;
  }
}
