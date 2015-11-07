'use strict';

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import RobustTransitionGroup from '../transition/InterruptibleTransitionGroup';
import * as nojquery from '../utils/nojquery';

import addClass from '../wrappers/addClass';
import callOnTransitionEnd from '../transition/callOnTransitionEnd';

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
  componentDidMount() {
    if (++openModalCount === 1) {
      nojquery.addClass(document.body, 'modal-open');
    }
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

class TransitionGroupChild extends Component {
  constructor(props)  {
    super(props);
    this.state = Object.assign({}, this.state, {
      isIn: false,
      isEntering: false,
      isLeaving: false,
      ref: 'root',
    });
  }
  componentWillAppear(callback) {
    this.componentWillEnter(callback);
  }
  componentWillEnter(callback) {
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
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
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
    this.setState({
      isIn: false,
      isEntering: false,
      isLeaving: true,
    });
  }
  render() {
    return React.cloneElement(this.props.children, this.state);
  }
}

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

    return <RobustTransitionGroup component="div" {...this.props} ref="group" className={className} style={{
      pointerEvents: children.length ? 'initial' : 'none',
    }}>
      {children.map(child => {
        if (!child) return child;
        return <TransitionGroupChild key={child.key}>
          {child}
        </TransitionGroupChild>;
      })}
    </RobustTransitionGroup>;
  }
}

Modal.TransitionGroup = ModalTransitionGroup;

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};
