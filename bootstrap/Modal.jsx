'use strict';

import React from 'react/addons';
import classNames from 'classnames';

import RobustTransitionGroup from '../RobustTransitionGroup';
import * as nojquery from '../nojquery';

import addClass from '../wrappers/addClass';
import addClassWhenIn from '../wrappers/transition/addClassWhenIn';

import './Modal.sass';

var Modal = React.createClass({
  render() {
    var {className, children} = this.props;
    className = classNames('modal fade', className);
    return <div ref="modal" {...this.props} className={className} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>;
  }
});

Modal = addClassWhenIn(Modal, 'in');

var ModalBackdrop = React.createClass({
  componentDidMount() {
    nojquery.addClass(document.body, 'modal-open');
  },
  componentWillUnmount() {
    nojquery.removeClass(document.body, 'modal-open');
  },
  onClick(event) {
    if (event.target === React.findDOMNode(this.refs.backdrop)) {
      this.props.onClick && this.props.onClick(event);
    }
  },
  render() {
    var {className} = this.props;
    className = classNames('modal-backdrop fade', className);
    return <div ref="backdrop" {...this.props} className={className} onClick={this.onClick}/>;
  }
});

ModalBackdrop = Modal.Backdrop = addClassWhenIn(ModalBackdrop, 'in');

var ModalHeader = Modal.Header = addClass('div', 'modal-header');
var ModalBody   = Modal.Body   = addClass('div', 'modal-body');
var ModalFooter = Modal.Footer = addClass('div', 'modal-footer');

var ModalTransitionGroup = Modal.TransitionGroup = React.createClass({
  getDefaultProps() {
    return {
      component: 'div',
    };
  },
  render() {
    var className = classNames(this.props.className, 'modal-transition-group');
    return <RobustTransitionGroup {...this.props} className={className}>
      {this.props.children}
    </RobustTransitionGroup>;
  }
});

export default Modal;
export { Modal, ModalHeader, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};