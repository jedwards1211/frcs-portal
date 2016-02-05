/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import {getContextClass} from './bootstrapPropUtils';
import {getSide} from '../utils/propUtils';

import './Popover.sass';

type Props = {
  title?: any,
  side?: 'top' | 'left' | 'bottom' | 'right',
  top?: boolean,
  left?: boolean,
  bottom?: boolean,
  right?: boolean,
  contextClass?: 'danger' | 'alarm' | 'error' | 'warning' | 'info' | 'success',
  danger?: boolean,
  alarm?: boolean,
  error?: boolean,
  warning?: boolean,
  info?: boolean,
  success?: boolean,
  className?: string,
  children?: any,
  positioned?: boolean,
}


export default class Popover extends Component {
  props: Props;
  static defaultProps: {};
  render()/*: ReactElement<any,any,any> */ {
    let {className, title, children, positioned} = this.props;

    let side = getSide(this.props) || 'top';
    let contextClass = getContextClass(this.props);

    className = classNames(className, 'popover', side, contextClass && ('popover-' + contextClass), {
      'popover-contentless': !children,
      'popover-positioned': positioned,
    });

    return <div {...this.props} className={className}>
      <div className="arrow"/>
      {title && <h3 className="popover-title">{title}</h3>}
      {children && <div className="popover-content">
        {children}
      </div>}
    </div>;
  }
}
