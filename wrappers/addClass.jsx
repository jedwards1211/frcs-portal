import React from 'react';
import classNames from 'classnames';

export default function addClass(Component, addedClassName) {
  return (props) => (<Component {...props} className={classNames(props.className, addedClassName)}>
    {props.children}
  </Component>);
}
