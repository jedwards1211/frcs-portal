'use strict';

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import RobustTransitionGroup from '../RobustTransitionGroup';
import * as nojquery from '../nojquery';

import addClass from '../wrappers/addClass';
import callOnTransitionEnd from '../callOnTransitionEnd';

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
  render() {
    let {className, dialogClassName, isIn, children} = this.props;
    className = classNames('modal fade', className, {'in': isIn});
    dialogClassName = classNames('modal-dialog', dialogClassName);
    return <div ref="modal" {...this.props} className={className} role="dialog">
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
  onClick = (event) => {
    // make sure the backdrop was what actually got clicked, not something
    // on top of it like the modal
    if (event.target === this.refs.backdrop) {
      this.props.onClick && this.props.onClick(event);
    }
  }
  render() {
    let {isIn, className} = this.props;
    className = classNames('modal-backdrop fade', className, {'in': isIn});
    return <div ref="backdrop" {...this.props} className={className} onClick={this.onClick}/>;
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
  static defaultProps = {
    component: 'div',
  }
  render() {
    var className = classNames(this.props.className, 'modal-transition-group');
    return <RobustTransitionGroup {...this.props} className={className}>
      {React.Children.map(this.props.children, child => {
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
