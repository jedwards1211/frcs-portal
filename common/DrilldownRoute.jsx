import React, {Component, PropTypes} from 'react';

import PageSlider from './PageSlider';

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
  };;;
  render() {
    let {route, children} = this.props;
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

    return <PageSlider activeIndex={activeIndex}>
      <IndexComponent {...this.props} route={route.indexRoute}/>
      {child}
    </PageSlider>;
  }
}
