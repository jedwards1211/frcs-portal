/* @flow */

import React from 'react';
import classNames from 'classnames';

import {getContextClass} from './bootstrapPropUtils';

type ProgressProps = {
  className?: string,
  style?: Object,
  min?: number,
  max?: number,
  value?: number,
  contextClass?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok',
  alarm?: ?any,
  error?: ?any,
  danger?: ?any,
  warning?: ?any,
  info?: ?any,
  success?: ?any,
  ok?: ?any,
  children?: any,
  active?: boolean,
  striped?: boolean
};

const Progress: (props: ProgressProps) => React.Element = props => {
  let {className, children, value} = props;
  className = classNames(className, "progress");
  return <div {...props} className={className}>
    {value != null ? <Bar {...props} className=""/> : children}
  </div>;
};

export default Progress;

type BarProps = {
  className?: string,
  style?: Object,
  min: number,
  max: number,
  value: number,
  contextClass?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok',
  alarm?: ?any,
  error?: ?any,
  danger?: ?any,
  warning?: ?any,
  info?: ?any,
  success?: ?any,
  ok?: ?any,
  children?: any,
  active?: boolean,
  striped?: boolean,
};

export const Bar: (props: BarProps) => React.Element = props => {
  let {className, children, style, min, max, value, active, striped} = props; 
  let contextClass = getContextClass(props);
  className = classNames(className, 'progress-bar', contextClass && 'progress-bar-' + contextClass, {
    active,
    'progress-bar-striped': striped
  });
  
  let percentage = (value - min) / (max - min) * 100;
  
  if (!children) {
    children = <span className="sr-only">
      {`${percentage}% Complete${contextClass ? ` (${contextClass})` : ''}`}
    </span>;
  }
  
  style = Object.assign({}, style, {
    width: percentage + '%'
  });
  
  return <div {...props} className={className} style={style} children={children} role="progressbar" 
                         aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}/>;
};
