import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';

import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Nav} from './View.jsx';
import PageSlider from './PageSlider';

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
    this.lastActiveChild = undefined;
    this.forceUpdate();
  };

  render() {
    let {className, route, children} = this.props;
    className = classNames(className, 'mf-drilldown-route');
    let child = React.Children.only(children);

    let activeIndex;
    if (child.props.route.path) {
      activeIndex = 1;
      this.lastActiveChild = child;
    }
    else {
      activeIndex = 0;
      child = this.lastActiveChild;
    }

    let IndexComponent = route.indexRoute.component;

    return <PageSlider activeIndex={activeIndex} onTransitionEnd={this.onTransitionEnd} className={className}>
      <IndexComponent {...this.props} route={route.indexRoute}/>
      {child && <TitleDecorator to={route.path} children={child}/>}
    </PageSlider>;
  }
}
