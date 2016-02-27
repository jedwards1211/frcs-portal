/* @flow */

import React, {Component, Children} from 'react';
import classNames from 'classnames';

import {getSizingClass} from './bootstrapPropUtils';

import './InputGroup.sass';

function createAddon(children) {
  let className = children.findIndex(child => child && child.type &&
    (child.type === 'button' || child.type.supportsInputGroupBtn)) >= 0 ?
      'input-group-btn' : 'input-group-addon';

  return children.length ? <span className={className}>
    {children}
  </span> : undefined;
}

export default class InputGroup extends Component {
  render(): ReactElement {
    let {className, children} = this.props;

    let sizingClass = getSizingClass(this.props);

    className = classNames(className, 'input-group', sizingClass && 'input-group-' + sizingClass);

    let childArray = Children.toArray(children);

    let inputIndex = childArray.findIndex(child => child && child.type &&
      ((child.type === 'input' && child.props.type !== 'checkbox' && child.props.type !== 'radio') ||
      child.type.supportsInputGroupInput));

    return <div {...this.props} className={className}>
      {createAddon(childArray.slice(0, inputIndex))}
      {childArray[inputIndex]}
      {createAddon(childArray.slice(inputIndex + 1))}
    </div>;
  }
}
