/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import {getContextClass, getContextClassValue} from './bootstrapPropUtils';

type Props = {
  type?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok' | 'primary',
  alarm?: ?any,
  error?: ?any,
  danger?: ?any,
  warning?: ?any,
  info?: ?any,
  success?: ?any,
  ok?: ?any,
  primary?: ?any,
  className?: string,
  children?: any,
};

export default class Button extends Component {
  props: Props;
  static defaultProps: {};
  render()/*: ReactElement<any,any,any> */ {
    let contextClass = getContextClass(this.props) || 'default';
    let content = getContextClassValue(this.props);

    let className = classNames(this.props.className, 'btn', 'btn-' + contextClass);

    return <button type="button" {...this.props} className={className}>
      {content}
      {this.props.children}
    </button>;
  }
}
