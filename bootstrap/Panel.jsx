/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import Collapse from './Collapse';
import {getContextClass, getContextClassValue} from './bootstrapPropUtils';
import {errorMessage} from '../utils/errorUtils';

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
  title?: any,
  heading?: any,
  footer?: any,
  collapseProps?: Object,
  open?: boolean,
  onTransitionEnd?: Function,
};

export default class Panel extends Component {
  props: Props;
  static defaultProps: {};
  render()/*: ReactElement<any,any,any> */ {
    let {className, children, heading, title, footer, collapseProps} = this.props;
    let contextClass = getContextClass(this.props) || 'default';
    let content = getContextClassValue(this.props);

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    className = classNames(className, 'panel', 'panel-' + contextClass);

    let body = (content || children) && <div className="panel-body">
      {content}
      {children}
    </div>;

    if (this.props.hasOwnProperty('collapse')) {
      let {open, onTransitionEnd} = this.props;
      body = <Collapse className="panel-collapse" {...(collapseProps || {})}
        open={open} onTransitionEnd={onTransitionEnd}>
        {body}
      </Collapse>;
    }

    return <div {...this.props} className={className}>
      {(heading || title) && <div className="panel-heading">
        {title && <h3 className="panel-title">{title}</h3>}
        {heading}
      </div>}
      {body}
      {footer && <div className="panel-footer">{footer}</div>}
    </div>;
  }
}
