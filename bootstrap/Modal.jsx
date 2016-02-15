'use strict';

import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {createSkinComponent} from 'react-skin';

import InterruptibleCSSTransitionGroup from '../transition/InterruptibleCSSTransitionGroup';
import CSSCore from 'fbjs/lib/CSSCore';

import './Modal.sass';

/////////////////////////////////////////////////////////////////////////////////
// See ModalExample.jsx for an example of how to use this
/////////////////////////////////////////////////////////////////////////////////

// Note: if you're creating a wrapper class that renders to a Modal, you'll want
// to apply the ../decorators/forwardTransitionsTo decorator to your wrapper class,
// because otherwise the Modal's transition callbacks won't get called

let openModalCount = 0;

const ModalHeaderSkin = createSkinComponent('BootstrapModalHeader', {component: 'div', className: 'modal-header'});
const ModalTitleSkin  = createSkinComponent('BootstrapModalTitle' , {component: 'h3' , className: 'modal-title' });
const ModalBodySkin   = createSkinComponent('BootstrapModalBody'  , {component: 'div', className: 'modal-body'  });
const ModalFooterSkin = createSkinComponent('BootstrapModalFooter', {component: 'div', className: 'modal-footer'});

export default class Modal extends Component {
  static contextTypes = {
    transitionEvents: PropTypes.shape({
      on: PropTypes.func.isRequired,
    }),
  };
  static childContextTypes = {
    HeaderSkin: PropTypes.any.isRequired,
    TitleSkin:  PropTypes.any.isRequired,
    BodySkin:   PropTypes.any.isRequired,
    FooterSkin: PropTypes.any.isRequired,
  };
  static propTypes = {
    dialogClassName: PropTypes.string,
    onOutsideClick:  PropTypes.func,
  };
  getChildContext() {
    return {
      HeaderSkin: ModalHeaderSkin,
      TitleSkin:  ModalTitleSkin,
      BodySkin:   ModalBodySkin,
      FooterSkin: ModalFooterSkin,
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
    let {className, dialogClassName, children, small} = this.props;
    className = classNames('modal mf-modal', className);
    dialogClassName = classNames('modal-dialog', dialogClassName, {
      'modal-sm': small
    });
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

export { Modal, ModalBackdrop, ModalTransitionGroup};
