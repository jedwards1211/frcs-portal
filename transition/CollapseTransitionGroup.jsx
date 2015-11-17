import React, {Component, PropTypes} from 'react';

import Collapse from '../bootstrap/Collapse';
import ObservableTransitionGroup from './ObservableTransitionGroup';

class ChildWrapper extends Component {
  render() {
    let {isIn, children} = this.props;
    return <Collapse {...this.props} open={isIn}>{children}</Collapse>;
  }
}

/**
 * An ObservableTransitionGroup that automatically collapses children in and out.
 */
export default class CollapseTransitionGroup extends Component {
  static propTypes = {
    collapseProps: PropTypes.object,
  }
  render() {
    let {children, collapseProps = {}} = this.props;
    return <ObservableTransitionGroup {...this.props}>
      {React.Children.map(children, (child, key) => child && <ChildWrapper {...collapseProps} key={key}>{child}</ChildWrapper>)}
    </ObservableTransitionGroup>;
  }
}
