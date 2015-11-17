'use strict';

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import ObservableTransitionGroup from '../transition/ObservableTransitionGroup';
import * as nojquery from '../utils/nojquery';

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
  static propTypes = {
    dialogClassName: PropTypes.string,
  }
  componentWillMount() {
    if (++openModalCount === 1) {
      nojquery.addClass(document.body, 'modal-open');
    }
    this.props.addTransitionListener(this);
  }
  componentDidEnter = () => {
    this.props.onEntered && this.props.onEntered();
  }
  componentWillUnmount() {
    if (--openModalCount === 0) {
      nojquery.removeClass(document.body, 'modal-open');
    }
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
    let {className, dialogClassName, isIn, children} = this.props;
    className = classNames('modal fade', className, {'in': isIn});
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
    let {isIn, className} = this.props;
    className = classNames('modal-backdrop fade', className, {'in': isIn});
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

    for (let i = 1; i < children.length; i++) {
      if (children[i - 1].props.onClick) {
        // this is a hack that lets us use onClick listeners on the backdrop
        // when in reality the transparent part of Modal gets in the way
        children[i] = React.cloneElement(children[i], 
          {onOutsideClick: children[i - 1].props.onClick});
      }
    }

    return <ObservableTransitionGroup component="div" {...this.props} ref="group" className={className} style={{
      pointerEvents: children.length ? 'initial' : 'none',
    }}>
      {children}
    </ObservableTransitionGroup>;
  }
}

Modal.TransitionGroup = ModalTransitionGroup;

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};
