'use strict';

import React, {PropTypes, Component} from 'react';
import classNames from 'classnames';

import RobustTransitionGroup from '../RobustTransitionGroup';
import * as nojquery from '../nojquery';

import addClass from '../wrappers/addClass';

import transitionGroupChild from '../decorators/transitionGroupChild';

import './Modal.sass';

/////////////////////////////////////////////////////////////////////////////////
// See ModalExample.jsx for an example of how to use this
/////////////////////////////////////////////////////////////////////////////////

// Note: if you're creating a wrapper class that renders to a Modal, you'll want
// to apply the ../decorators/forwardTransitionsTo decorator to your wrapper class,
// because otherwise the Modal's transition callbacks won't get called

@transitionGroupChild('modal')
export default class Modal extends Component {
  static propTypes = {
    dialogClassName: PropTypes.string,
  }
  render(content) {
    let {className, dialogClassName, children} = this.props;
    className = classNames('modal fade', className, {'in': this.state.isIn});
    dialogClassName = classNames('modal-dialog', dialogClassName);
    if (!content) {
      content = <div className="modal-content">
        {children}
      </div>;
    }
    return <div ref="modal" {...this.props} className={className} role="dialog">
      <div className={dialogClassName}>
        {content}
      </div>
    </div>;
  }
}

Modal.Small = class extends Modal {}
Modal.Small.defaultProps = {
  dialogClassName: 'modal-sm',
};

var ModalContent = Modal.Content = addClass('div', 'modal-content');

@transitionGroupChild('backdrop')
class ModalBackdrop extends Component {
  componentDidMount() {
    nojquery.addClass(document.body, 'modal-open');
  }
  componentWillUnmount() {
    nojquery.removeClass(document.body, 'modal-open');
  }
  onClick = (event) => {
    if (event.target === this.refs.backdrop) {
      this.props.onClick && this.props.onClick(event);
    }
  }
  render() {
    let {isIn} = this.state;
    let {className} = this.props;
    className = classNames('modal-backdrop fade', className, {'in': isIn});
    return <div ref="backdrop" {...this.props} className={className} onClick={this.onClick}/>;
  }
}

Modal.Backdrop = ModalBackdrop;

var ModalHeader = Modal.Header = addClass('div', 'modal-header');
var ModalBody   = Modal.Body   = addClass('div', 'modal-body');
var ModalFooter = Modal.Footer = addClass('div', 'modal-footer');
var ModalTitle  = Modal.Title  = addClass('h4', 'modal-title');

class ModalTransitionGroup extends Component {
  static defaultProps = {
    component: 'div',
  }
  render() {
    var className = classNames(this.props.className, 'modal-transition-group');
    return <RobustTransitionGroup {...this.props} className={className}>
      {this.props.children}
    </RobustTransitionGroup>;
  }
}

Modal.TransitionGroup = ModalTransitionGroup;

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalBackdrop, ModalTransitionGroup};
