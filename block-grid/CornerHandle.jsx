import React, {Component} from 'react';
import classNames from 'classnames';

import './CornerHandle.sass';

export default class CornerHandle extends Component {
  render() {
    let className = classNames(this.props.className, 'corner-handle');
    return <div {...this.props} className={className}/>;
  }
}