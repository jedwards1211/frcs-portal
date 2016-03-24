/* @flow */

import React, {Component, Children, PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

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
  static childContextTypes = {
    insideInputGroup: PropTypes.bool.isRequired
  };
  getChildContext(): Object {
    return {
      insideInputGroup: true
    };
  }
  render(): ReactElement {
    let {className, children} = this.props;

    let sizingClass = getSizingClass(this.props);

    className = classNames(className, 'input-group', sizingClass && 'input-group-' + sizingClass);

    let childArray = Children.toArray(children);

    let inputIndex = childArray.findIndex(child => child && child.type &&
      ((child.type === 'input' && child.props.type !== 'checkbox' && child.props.type !== 'radio') ||
      child.type.supportsInputGroupInput));

    let onClick = _.get(childArray, [1, 'props', 'onClick']);
    
    let extraInputProps = {};

    if (inputIndex === 0 && !childArray[0].props.onEnterDown && onClick) {
      extraInputProps.onEnterDown = onClick;
    }
    if ('value' in this.props && !('value' in childArray[inputIndex].props)) {
      extraInputProps.value = this.props.value;
    }
    
    if (_.size(extraInputProps)) {
      childArray[inputIndex] = React.cloneElement(childArray[inputIndex], extraInputProps);
    }

    return <div {...this.props} className={className}>
      {createAddon(childArray.slice(0, inputIndex))}
      {childArray[inputIndex]}
      {createAddon(childArray.slice(inputIndex + 1))}
    </div>;
  }
}
