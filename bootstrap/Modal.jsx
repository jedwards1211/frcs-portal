'use strict';

import React from 'react/addons';
import classNames from 'classnames';
import _ from 'lodash';

import RobustTransitionGroup from '../RobustTransitionGroup';

import callOnTransitionEnd from '../callOnTransitionEnd';

import { addClass, removeClass } from '../nojquery';

import './Modal.sass';

/**
 * Wrapper for a Bootstrap modal.  Use inside a ReactTransitionGroup or RobustTransitionGroup.
 */
var Modal = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    onRequestHide:      React.PropTypes.func,
    transitionDuration: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      transitionDuration: 300,
    };
  },
  getInitialState() {
    return {
      isIn: false,
    };
  },
  componentWillAppear(callback) {
    callOnTransitionEnd(React.findDOMNode(this.refs.modal), callback, this.props.transitionDuration);
    this.setState({isIn: true});
  },
  componentWillEnter(callback) {
    callOnTransitionEnd(React.findDOMNode(this.refs.modal), callback, this.props.transitionDuration);
    this.setState({isIn: true});
  },
  componentWillLeave(callback) {
    callOnTransitionEnd(React.findDOMNode(this.refs.modal), callback, this.props.transitionDuration);
    this.setState({isIn: false});
  },
  componentDidMount() {
    addClass(document.body, 'modal-open');
  },
  componentWillUnmount() {
    removeClass(document.body, 'modal-open');
  },
  onModalClick(event) {
    if (event.target === React.findDOMNode(this.refs.modal)) {
      this.props.onRequestHide && this.props.onRequestHide();
    }
  },
  render() {
    var {className, style} = this.props;
    var {isIn} = this.state;

    var backdropClass = classNames('modal-backdrop', 'fade', {'in': isIn});

    var modalClass = classNames('modal', 'fade', className, {'in': isIn});

    return (
      <div className="modal-root">
        <div className={backdropClass}/>
        <div ref="modal" {...this.props} className={modalClass} role="dialog"
          aria-hidden={!isIn} onClick={this.onModalClick}>
          <div className="modal-dialog">
            <div className="modal-content">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

function createClassNameMixer(className) {
  return React.createClass({
    mixins: [React.addons.PureRenderMixin],
    render() {
      var _className = classNames(this.props.className, className);
      return <div {...this.props} className={_className}>
        {this.props.children}
      </div>;
    }
  });
}

var ModalHeader = Modal.Header = createClassNameMixer('modal-header');
var ModalBody   = Modal.Body   = createClassNameMixer('modal-body');
var ModalFooter = Modal.Footer = createClassNameMixer('modal-footer');

var ModalTransitionGroup = Modal.TransitionGroup = React.createClass({
  render() {
    var className = classNames(this.props.className, 'modal-transition-group');
    var style = _.assign({}, this.props.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    });
    return <RobustTransitionGroup component="div" {...this.props} className={className} style={style}>
      {this.props.children}
    </RobustTransitionGroup>;
  }
});

export default Modal;
export { Modal, ModalHeader, ModalBody, ModalFooter };