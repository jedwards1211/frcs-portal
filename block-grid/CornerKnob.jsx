import React, {Component} from 'react';
import classNames from 'classnames';

import './CornerKnob.sass';

export default class CornerKnob extends Component {
  render() {
    let className = classNames(this.props.className, 'corner-knob');
    return <div {...this.props} className={className}/>;
  }
}