/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import addClass from '../wrappers/addClass';
import {getContextClass, getContextClassValue} from './bootstrapPropUtils';

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
  // these are included for backwards compatibility
  static Auto    = Alert;
  static Info    = props => (<Alert info    {...props}/>);
  static OK      = props => (<Alert ok      {...props}/>);
  static Success = props => (<Alert success {...props}/>);
  static Warning = props => (<Alert warning {...props}/>);
  static Danger  = props => (<Alert danger  {...props}/>);
  static Error   = props => (<Alert error   {...props}/>);
  static Alarm   = props => (<Alert alarm   {...props}/>);
  static Link    = addClass('a', 'alert-link');
  render()/*: ReactElement<any,any,any> */ {
    let contextClass = getContextClass(this.props, 'type');
    let content = getContextClassValue(this.props);
    if (typeof content === 'boolean') content = undefined;

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    let className = classNames(this.props.className, 'alert', contextClass && ('alert-' + contextClass));

    return <div {...this.props} className={className}>{content}{this.props.children}</div>;
  }
}
