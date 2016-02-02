import React, {Component} from 'react';
import classNames from 'classnames';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup.jsx';

import './ToastContainer.sass';

export default class ToastContainer extends Component {
  render() {
    var {className, children} = this.props;
    className = classNames('mf-toast-container', className);

    return <div {...this.props} className={className}>
      <CollapseTransitionGroup component="div">
        {children}
      </CollapseTransitionGroup>
    </div>;
  }
}
