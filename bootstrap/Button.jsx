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
  // these are included for backwards compatibility
  static Info    = props => (<Button info    {...props}/>);
  static OK      = props => (<Button ok      {...props}/>);
  static Primary = props => (<Button primary {...props}/>);
  static Success = props => (<Button success {...props}/>);
  static Warning = props => (<Button warning {...props}/>);
  static Danger  = props => (<Button danger  {...props}/>);
  static Error   = props => (<Button error   {...props}/>);
  static Alarm   = props => (<Button alarm   {...props}/>);
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
