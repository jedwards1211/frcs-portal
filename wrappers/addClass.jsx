import React from 'react';
import classNames from 'classnames';

export default function addClass(Component, addedClassName) {
  return class extends React.Component {
    render() {
      var {className, children} = this.props;
      className = classNames(className, addedClassName);
      return <Component {...this.props} className={className}>
        {children}
      </Component>;
    }
  };
}