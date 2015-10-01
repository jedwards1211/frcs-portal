'use strict';

import React from 'react';
import classNames from 'classnames';

import RobustTransitionGroup from '../RobustTransitionGroup';
import * as nojquery from '../nojquery';

import addClass from '../wrappers/addClass';
import addProps from '../wrappers/addProps';
import addClassWhenIn from '../wrappers/transition/addClassWhenIn';

import './Modal.sass';

/////////////////////////////////////////////////////////////////////////////////
// See ModalExample.jsx for an example of how to use this
/////////////////////////////////////////////////////////////////////////////////

var ModalBase = React.createClass({
  render() {
    var {className, dialogClassName, children} = this.props;
    className = classNames('modal fade', className);
    dialogClassName = classNames('modal-dialog', dialogClassName);
    return <div ref="modal" {...this.props} className={className} role="dialog">
      <div className={dialogClassName}>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>;
  }
});

var Modal = addClassWhenIn(ModalBase, 'in');
Modal.Small = addClassWhenIn(addProps(ModalBase, {dialogClassName: 'modal-sm'}), 'in');

var ModalBackdrop = React.createClass({
  componentDidMount() {
    nojquery.addClass(document.body, 'modal-open');
  },
  componentWillUnmount() {
    nojquery.removeClass(document.body, 'modal-open');
  },
  onClick(event) {
    if (event.target === this.refs.backdrop) {
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
var ModalTitle  = Modal.Title  = addClass('h4', 'modal-title');

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
export { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};
