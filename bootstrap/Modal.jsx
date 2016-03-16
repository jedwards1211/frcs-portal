'use strict';

import React, {PropTypes, Component, Children} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import {getSizingClass} from './bootstrapPropUtils';

import InterruptibleCSSTransitionGroup from '../transition/InterruptibleCSSTransitionGroup';
import CSSCore from 'fbjs/lib/CSSCore';

import {View} from './../common/View.jsx';

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
  };
  static childContextTypes = {
    ViewClassName: PropTypes.string.isRequired,
    HeaderClassName:PropTypes.string.isRequired,
    TitleClassName: PropTypes.string.isRequired,
    BodyClassName:  PropTypes.string.isRequired,
    FooterClassName:PropTypes.string.isRequired,
  };
  static propTypes = {
    dialogClassName: PropTypes.string,
    onOutsideClick:  PropTypes.func,
  };
  getChildContext() {
    return {
      ViewClassName: 'modal-content',
      HeaderClassName:'modal-header',
      TitleClassName: 'modal-title',
      BodyClassName:  'modal-body',
      FooterClassName:'modal-footer',
    };
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
  };
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
  };
  render() {
    let {className, dialogClassName, children} = this.props;
    className = classNames('modal mf-modal', className);

    let sizingClass = getSizingClass(this.props);
    dialogClassName = classNames('modal-dialog', dialogClassName, sizingClass && 'modal-' + sizingClass);

    if (Children.count(children) > 1) {
      children = <View>{children}</View>;
    }
    return <div ref="modal" {...this.props} className={className} role="dialog"
      onClick={this.onClick}>
      <div className={dialogClassName}>
        {children}
      </div>
    </div>;
  }
}

class ModalBackdrop extends Component {
  render() {
    let {className} = this.props;
    className = classNames('modal-backdrop', className);
    return <div ref="backdrop" {...this.props} className={className}/>;
  }
}

Modal.Backdrop = ModalBackdrop;

class ModalTransitionGroup extends Component {
  render() {
    let {className, autoBackdrop} = this.props;
    className = classNames(className, 'modal-transition-group');
    let children = React.Children.toArray(this.props.children);

    if (autoBackdrop && children.length) {
      children.splice(children.length - 1, 0, <ModalBackdrop key="backdrop"/>);
    }

    return <InterruptibleCSSTransitionGroup component="div" {...this.props}
      transitionName="modal" className={className} 
      style={{pointerEvents: children.length ? 'initial' : 'none'}}>
      {children}
    </InterruptibleCSSTransitionGroup>;
  }
}

Modal.TransitionGroup = ModalTransitionGroup;

export { Modal, ModalBackdrop, ModalTransitionGroup};
