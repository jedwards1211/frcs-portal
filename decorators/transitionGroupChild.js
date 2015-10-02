import {PropTypes} from 'react';
import {assign} from 'lodash';

import callOnTransitionEnd from '../callOnTransitionEnd';

export default function transitionGroupChild(ref) {
  return function decorator(target) {
    if (!target.propTypes) {
      target.propTypes = {};
    }
    target.propTypes.transitionTimeout = PropTypes.number;

    return class extends target {
      constructor(props)  {
        super(props);
        this.state = assign({}, this.state, {
          isIn: false,
          isEntering: false,
          isLeaving: false,
        });
      }
      componentWillAppear(callback) {
        this.componentWillEnter(callback);
      }
      componentWillEnter(callback) {
        callOnTransitionEnd(this.refs[ref], callback, this.props.transitionTimeout);
        // we setTimeout so that the component can mount without inClassName first,
        // and then add it a moment later.  Otherwise it may not transition
        setTimeout(() => this.setState({
          isIn: true,
          isEntering: true,
          isLeaving: false,
        }),  0);
      }
      componentDidEnter() {
        this.setState({
          isEntering: false,
        });
      }
      componentWillLeave(callback) {
        callOnTransitionEnd(this.refs[ref], callback, this.props.transitionTimeout);
        this.setState({
          isIn: false,
          isEntering: false,
          isLeaving: true,
        });
      }
    }
  }
}