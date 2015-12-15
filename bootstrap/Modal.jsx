'use strict';

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import InterruptibleCSSTransitionGroup from '../transition/InterruptibleCSSTransitionGroup';
import CSSCore from 'fbjs/lib/CSSCore';

import addClass from '../wrappers/addClass';

import './Modal.sass';

/////////////////////////////////////////////////////////////////////////////////
// See ModalExample.jsx for an example of how to use this
/////////////////////////////////////////////////////////////////////////////////

// Note: if you're creating a wrapper class that renders to a Modal, you'll want
// to apply the ../decorators/forwardTransitionsTo decorator to your wrapper class,
// because otherwise the Modal's transition callbacks won't get called

let openModalCount = 0;

export default class Modal extends Component {
  static contextTypes = {
    transitionEvents: PropTypes.shape({
      on: PropTypes.func.isRequired,
    }),
  }
  static propTypes = {
    dialogClassName: PropTypes.string,
    onOutsideClick:  PropTypes.func,
  }
  componentWillMount() {
    if (++openModalCount === 1) {
      CSSCore.addClass(document.body, 'modal-open');
    }
    let {transitionEvents} = this.context;
    if (transitionEvents) transitionEvents.on('componentDidEnter', this.componentDidEnter);
  }
  componentDidEnter = () => {
    this.props.onEntered && this.props.onEntered();
  }
  componentWillUnmount() {
    if (--openModalCount === 0) {
      CSSCore.removeClass(document.body, 'modal-open');
    }
    let {transitionEvents} = this.context;
    if (transitionEvents) transitionEvents.removeListener('componentDidEnter', this.componentDidEnter);
  }
  onClick = (e) => {
    if (e.target === this.refs.modal) {
      // e.target will be something else if clicked within .modal-dialog
      this.props.onOutsideClick && this.props.onOutsideClick(e);
    }
    else {
      this.props.onClick && this.props.onClick(e);
    }
  }
  render() {
    let {className, dialogClassName, children} = this.props;
    className = classNames('modal mf-modal', className);
    dialogClassName = classNames('modal-dialog', dialogClassName);
    return <div ref="modal" {...this.props} className={className} role="dialog"
      onClick={this.onClick}>
      <div className={dialogClassName}>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>;
  }
}

Modal.Small = class extends Modal {}
Modal.Small.defaultProps = {
  dialogClassName: 'modal-sm',
};

var ModalContent = Modal.Content = addClass('div', 'modal-content');

class ModalBackdrop extends Component {
  render() {
    let {className} = this.props;
    className = classNames('modal-backdrop', className);
    return <div ref="backdrop" {...this.props} className={className}/>;
  }
}

Modal.Backdrop = ModalBackdrop;

var ModalHeader = Modal.Header = addClass('div', 'modal-header');
var ModalBody   = Modal.Body   = addClass('div', 'modal-body');
var ModalFooter = Modal.Footer = addClass('div', 'modal-footer');
var ModalTitle  = Modal.Title  = addClass('h4', 'modal-title');

class ModalTransitionGroup extends Component {
  render() {
    let className = classNames(this.props.className, 'modal-transition-group');
    let children = React.Children.toArray(this.props.children);

    return <InterruptibleCSSTransitionGroup component="div" {...this.props}
      transitionName="modal" className={className} 
      style={{pointerEvents: children.length ? 'initial' : 'none'}}>
      {children}
    </InterruptibleCSSTransitionGroup>;
  }
}

Modal.TransitionGroup = ModalTransitionGroup;

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};
