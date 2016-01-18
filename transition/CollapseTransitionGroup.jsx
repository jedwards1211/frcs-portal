import React, {Component, PropTypes} from 'react';

import Collapse from '../bootstrap/Collapse';
import ObservableTransitionGroup from './ObservableTransitionGroup';

class ChildWrapper extends Component {
  render() {
    let {isIn, children, expandOnAppear, isAppearing} = this.props;
    // use the key to prevent animation by remounting the element
    return <Collapse key={isAppearing && !expandOnAppear ? 1 : 0} {...this.props} open={isIn}>{children}</Collapse>;
  }
}

/**
 * An ObservableTransitionGroup that automatically collapses children in and out.
 */
export default class CollapseTransitionGroup extends Component {
  static propTypes = {
    expandOnAppear: PropTypes.bool,
    collapseProps:  PropTypes.object,
  };
  static defaultPropTypes = {
    expandOnAppear: false,
  };
  wrapChild = (child) => {
    let {collapseProps, expandOnAppear} = this.props;
    return <ChildWrapper {...collapseProps} expandOnAppear={expandOnAppear} key={child.key}>{child}</ChildWrapper>;
  };
  render() {
    return <ObservableTransitionGroup {...this.props} childFactory={this.wrapChild}/>;
  }
}
