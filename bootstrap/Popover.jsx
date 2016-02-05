/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import {getContextClass} from './bootstrapPropUtils';
import {getEnumProp} from '../utils/propUtils';

import './Popover.sass';

type Props = {
  title?: any,
  side?: 'top' | 'left' | 'bottom' | 'right',
  top?: void,
  left?: void,
  bottom?: void,
  right?: void,
  contextClass?: 'danger' | 'alarm' | 'error' | 'warning' | 'info' | 'success',
  danger?: void,
  alarm?: void,
  error?: void,
  warning?: void,
  info?: void,
  success?: void,
  className?: string,
  children?: any,
}

const SIDES = ['top', 'left', 'bottom', 'right'];

export default class Popover extends Component {
  props: Props;
  static defaultProps: {};
  render()/*: ReactElement<any,any,any> */ {
    let {className, title, children} = this.props;

    let side = this.props.side || getEnumProp(this.props, SIDES) || 'top';
    let contextClass = getContextClass(this.props);

    className = classNames(className, 'popover', side, contextClass && ('popover-' + contextClass));

    return <div {...this.props} className={className}>
      <div className="arrow"/>
      {title && <h3 className="popover-title">{title}</h3>}
      <div className="popover-content">
        {children}
      </div>
    </div>;
  }
}
