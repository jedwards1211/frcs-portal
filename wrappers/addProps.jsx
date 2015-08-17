import React from 'react';
import classNames from 'classnames';

export default function addProps(Component, addedProps) {
  return class extends React.Component {
    render() {
      return <Component {...this.props} {...addedProps}>
        {this.props.children}
      </Component>;
    }
  };
}