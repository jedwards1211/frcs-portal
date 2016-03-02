/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {createSelector} from 'reselect';
import _ from 'lodash';

import PageSlider from './PageSlider.jsx';
import Alert from '../bootstrap/Alert.jsx';
import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Link} from './Drilldown.jsx';
import {splitPath, joinPath} from './DrilldownModel.jsx';

import {View, Header, Title, Body} from './View.jsx';

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
      // keep the child route mounted while we are animating back to an ancestor
      this.setState({fromPath: this.props.path});
    }
  }
  selectPageSliderProps: (comp: SimpleDrilldownSkin) => Object = createSelector(
    comp => comp.props.root,
    comp => comp.props.path,
    comp => comp.state.fromPath,
    (root, path, fromPath) => {
      let parts = splitPath(fromPath || path);
      let activeIndex = fromPath ? splitPath(path).length : parts.length;

      let route = root;

      let children = [<PathContext path="/" key="/">
        {route.render({...this.props, path: '/', route})}
      </PathContext>];

      for (let i = 0; i < parts.length && route; i++) {
        route = route.getChild(parts[i]);
        if (!route) break;
        let partPath = joinPath(parts.slice(0, i + 1));
        children.push(<PathContext path={partPath} key={partPath}>
          {route.render({...this.props, path, route})}
        </PathContext>);
      }

      if (children[parts.length] === undefined || children[parts.length] === null) {
        children[parts.length] = <View>
          <Header>
            <Title>
              Invalid Route
            </Title>
          </Header>
          <Body>
            <Alert danger>
              Can't find route: {fromPath || path}
            </Alert>
          </Body>
        </View>;
      }

      let lengthBefore = children.length;
      children = _.filter(children,
        child => child.props.children !== undefined && child.props.children !== null);

      activeIndex = activeIndex - lengthBefore + children.length;

      return {children, activeIndex};
    }
  );
  onTransitionEnd: () => void = () => this.setState({fromPath: undefined});
  render(): ReactElement {
    let {className} = this.props;

    className = classNames(className, 'mf-simple-drilldown');

    return <div {...this.props} className={className}>
      <PageSlider {...this.selectPageSliderProps(this)} onTransitionEnd={this.onTransitionEnd}/>
    </div>;
  }
}
