import React, {Component} from 'react';
import classNames from 'classnames';

import './Toast.sass';

export default class Toast extends Component {
  render() {
    let {className, children} = this.props;
    className = classNames(className, 'mf-toast');
    return <div {...this.props} className={className}>
      {children}
    </div>;
  }
}
