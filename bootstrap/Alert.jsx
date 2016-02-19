/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import addClass from '../wrappers/addClass';
import {getContextClass, getContextContent, getShadeClass} from './bootstrapPropUtils';

import {errorMessage} from '../utils/reactErrorUtils';

type Props = {
  contextClass?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok',
  alarm?: ?any,
  error?: ?any,
  danger?: ?any,
  warning?: ?any,
  info?: ?any,
  success?: ?any,
  ok?: ?any,
  shade?: 'darker' | 'brighter',
  darker?: boolean,
  brighter?: boolean,
  className?: string,
  children?: any,
};

export default class Alert extends Component<void,Props,void> {
  static Link = addClass('a', 'alert-link');
  render(): ReactElement {
    let {className, children} = this.props;
    let contextClass = getContextClass(this.props, 'type');
    let shadeClass = getShadeClass(this.props);
    let content = getContextContent(this.props);

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    className = classNames(className, 'alert', contextClass && ('alert-' + contextClass), shadeClass);

    return <div role="alert" {...this.props} className={className}>
      {content}
      {children}
    </div>;
  }
}
