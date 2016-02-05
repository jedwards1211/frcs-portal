/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import addClass from '../wrappers/addClass';
import {getContextClass, getContextContent} from './bootstrapPropUtils';

import {errorMessage} from '../utils/errorUtils';

type Props = {
  type?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok',
  alarm?: ?any,
  error?: ?any,
  danger?: ?any,
  warning?: ?any,
  info?: ?any,
  success?: ?any,
  ok?: ?any,
  className?: string,
  children?: any,
};

export default class Alert extends Component {
  props: Props;
  defaultProps: {};
  static Link    = addClass('a', 'alert-link');
  render()/*: ReactElement<any,any,any> */ {
    let contextClass = getContextClass(this.props, 'type');
    let content = getContextContent(this.props);
    if (typeof content === 'boolean') content = undefined;

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    let className = classNames(this.props.className, 'alert', contextClass && ('alert-' + contextClass));

    return <div role="alert" {...this.props} className={className}>{content}{this.props.children}</div>;
  }
}
