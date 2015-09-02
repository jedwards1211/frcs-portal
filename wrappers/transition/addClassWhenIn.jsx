import React from 'react';
import classNames from 'classnames';

import callOnTransitionEnd from '../../callOnTransitionEnd';

export default function addClassWhenIn(Component, inClassName) {
  return React.createClass({
    propTypes: {
      transitionTimeout: React.PropTypes.number,
    },
    getDefaultProps() {
      return {
        transitionTimeout: 1000,
      };
    },
    getInitialState() {
      return {
        isIn: false,
      };
    },
    componentWillAppear(callback) {
      this.componentWillEnter(callback);
    },
    componentWillEnter(callback) {
      callOnTransitionEnd(React.findDOMNode(this.refs.component), callback, this.props.transitionTimeout);
      // we setTimeout so that the component can mount without inClassName first,
      // and then add it a moment later.  Otherwise it may not transition
      setTimeout(() => this.setState({isIn: true}),  0);
    },
    componentWillLeave(callback) {
      callOnTransitionEnd(React.findDOMNode(this.refs.component), callback, this.props.transitionTimeout);
      this.setState({isIn: false});
    },
    render() {
      var {className, children} = this.props;
      className = classNames(className, {[inClassName]: this.state.isIn});
      return <Component ref="component" {...this.props} className={className}>
        {children}
      </Component>;
    }
  });
}
