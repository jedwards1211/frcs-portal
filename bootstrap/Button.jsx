/* @flow */

import React, {Component, Children, PropTypes} from 'react';
import classNames from 'classnames';
import {getContextClass, getContextContent, getSizingClass} from './bootstrapPropUtils';

export type Props = {
  a?: boolean,
  input?: boolean,
  submit?: boolean,
  caret?: boolean,
  contextClass?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok' | 'primary',
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
  block?: boolean,
  active?: boolean,
  disabled?: boolean,
  sm?: boolean,
  small?: boolean,
  lg?: boolean,
  large?: boolean,
  xs?: boolean,
  extraSmall?: boolean,
  sizing?: 'sm' | 'small' | 'lg' | 'large' | 'xs' | 'extraSmall',
};

export default class Button extends Component<void,Props,void> {
  static contextTypes = {
    insideFormGroup: PropTypes.bool,
    insideInputGroup: PropTypes.bool,
    insideButtonGroup: PropTypes.bool,
    insideButtonToolbar: PropTypes.bool
  };
  static supportsInputGroupBtn = true;
  render(): ReactElement {
    let {a, input, submit, caret, active, disabled, block, className, children} = this.props;
    let {insideFormGroup, insideInputGroup, insideButtonGroup, insideButtonToolbar} = this.context;

    let contextClass = getContextClass(this.props) || 'default';
    let sizingClass = getSizingClass(this.props);
    let content = getContextContent(this.props);

    className = classNames(className, 'btn', 'btn-' + contextClass,
      sizingClass && 'btn-' + sizingClass, {
        active,
        'btn-block': block,
        'form-control': insideFormGroup && !insideInputGroup && !insideButtonGroup && !insideButtonToolbar
      });

    if (caret) {
      if (Children.count(children)) {
        children = [
          ...Children.toArray(children),
          <span key="space"> </span>,
          <span key="caret" className="caret"/>,
        ];
      }
      else {
        children = <span className="caret"/>;
      }
    }

    if (a) {
      className = classNames(className, {disabled});
      return <a role="button" {...this.props} className={className}>
        {content}
        {children}
      </a>;
    }

    if (input) {
      return <input type={submit ? 'submit' : 'button'} value={content || children} {...this.props}
                    children={undefined} className={className}/>;
    }

    return <button type={submit ? 'submit' : 'button'} {...this.props} className={className}>
      {content}
      {children}
    </button>;
  }
}
