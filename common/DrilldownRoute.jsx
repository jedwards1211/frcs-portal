import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';
import _ from 'lodash';

import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Nav} from './View.jsx';
import PageSlider from './PageSlider';
import createPath from '../react-router/createPath';

import {createSkinDecorator} from 'react-skin';

import './DrilldownRoute.sass';

const TitleDecorator = createSkinDecorator({
  Title: (Title, props, decorator) => {
    let {children} = props;
    let {to} = decorator.props;

    return <Title {...props}>
      {to && <Nav left>
        <Link to={to}><Glyphicon menuLeft/></Link>
      </Nav>}
      {children}
    </Title>;
  }
});

/**
 * When used as the component for a react-router route with an IndexRoute and
 * other routes as children, will use PageSlider to animate between the IndexRoute
 * and child routes as they become active.
 */
export default class DrilldownRoute extends Component {
  static propTypes = {
    route: PropTypes.shape({
      indexRoute: PropTypes.shape({
        component:  PropTypes.any.isRequired,
      }).isRequired,
    }),
  };
  onTransitionEnd = () => {
    this.lastRoutes = undefined;
    this.lastParams = undefined;
    this.forceUpdate();
  };

  render() {
    let {className, history, location, params, route, routes} = this.props;
    className = classNames(className, 'mf-drilldown-route');

    let routeIndex = routes.indexOf(route);
    if (route.indexRoute && routes[routes.length - 1] === route.indexRoute) {
      routes = routes.slice(0, routes.length - 1);
    }
    
    let activeIndex = routes.length - routeIndex - 1;
    
    if (!this.lastRoutes || activeIndex >= this.lastActiveIndex ||
        !_.every(_.range(activeIndex), index => this.lastRoutes[index] === routes[index])) {
      this.lastParams = params;
      this.lastRoutes = routes;
    }
    this.lastActiveIndex = activeIndex;

    let IndexComponent = route.indexRoute.component;

    return <PageSlider activeIndex={activeIndex} onTransitionEnd={this.onTransitionEnd} className={className}>
      <IndexComponent {...this.props} route={route.indexRoute}/>
      {/* {child && <TitleDecorator to={route.path} children={child}/>} */}
      {this.lastRoutes.slice(routeIndex + 1).map((route, index) => {
        let Comp = route.component;
        return <TitleDecorator key={index} 
                               to={createPath({
                                  routes: this.lastRoutes, 
                                  params: this.lastParams, 
                                  endIndex: routeIndex + 1 + index
                               })}>
          <Comp route={route} routes={this.lastRoutes} 
                history={history} location={location} params={this.lastParams}/>
        </TitleDecorator>;
      })}
    </PageSlider>;
  }
}
