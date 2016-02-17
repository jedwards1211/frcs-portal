/* @flow */

import React, {Component, Children} from 'react';
import classNames from 'classnames';
import {getContextClass, getShadeClass} from './bootstrapPropUtils';
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
  shade?: 'darker' | 'brighter',
  darker?: boolean,
  brighter?: boolean,
  className?: string,
  children?: any,
  positioned?: boolean,
}


export default class Popover extends Component {
  props: Props;
  static defaultProps: {};
  render(): ReactElement {
    let {className, title, children, positioned} = this.props;

    let side = getSide(this.props) || 'top';
    let contextClass = getContextClass(this.props);
    let shadeClass = getShadeClass(this.props);

    className = classNames(className, 'popover', side, shadeClass, contextClass && ('popover-' + contextClass), {
      'popover-contentless': !Children.count(children),
      'popover-positioned': positioned,
    });

    return <div {...this.props} className={className}>
      <div className="arrow"/>
      {title && <h3 className="popover-title">{title}</h3>}
      <div className="popover-content">
        {children}
      </div>
    </div>;
  }
}
