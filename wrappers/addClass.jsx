import React from 'react';
import classNames from 'classnames';

export default function addClass(Component, addedClassName) {
  return (props) => {
    if (props) {
      return <Component {...props} className={classNames(props.className, addedClassName)}>
        {props.children}
      </Component>;
    }
    else {
      return <Component className={addedClassName}/>;
    }
  };
}
