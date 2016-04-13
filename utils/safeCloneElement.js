/* @flow */

import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

/**
 * Like React.cloneElement, but:
 * - If props contains any functions, they will be wrapped with a function that calls the element.props[key] first, 
 *   instead of stomping on it (if it exists)
 * - If props contains className, it will be merged with element.props.className if it exists
 * - If props contains style, it will be assigned to element.props.style if it exists
 */
export default function safeCloneElement(element: React.Element, props: Object, children?: any): React.Element {
  props = _.mapValues(props, (value, key) => {
    if (_.isFunction(value)) {
      let origFn = element.props[key];
      if (_.isFunction(origFn)) {
        return (...args) => {
          origFn(...args);
          value(...args);
        };
      }
    }
    return value;
  });
  if (props.className) {
    props.className = classNames(element.props.className, props.className); 
  }
  if (_.isObject(props.style) && _.isObject(element.props.style)) {
    props.style = Object.assign({}, element.props.style, props.style);
  }
  if (arguments.length > 2) {
    return React.cloneElement(element, props, children);
  }
  return React.cloneElement(element, props);
}
