/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import {getFormGroupContextClass, getContextContent} from './bootstrapPropUtils';
import {errorMessage} from '../utils/reactErrorUtils';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup.jsx';

type GroupProps = {
  className?: string,
  label?: any,
  children?: any,
  contextClass?: 'error' | 'warning' | 'success',
  error?: ?any,
  warning?: ?any,
  success?: ?any,
  validation?: {
    contextClass?: 'error' | 'warning' | 'success',
    error?: any,
    warning?: any,
    success?: any
  }
};

export class Group extends Component<void,GroupProps,void> {
  static contextTypes = {
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
  };
  render(): ReactElement {
    let {className, label, children, validation} = this.props;

    let contextClass   = getFormGroupContextClass(validation || this.props);
    let contextContent = getContextContent       (validation || this.props);

    className = classNames(className, 'form-group', contextClass && 'has-' + contextClass);

    let {labelClass, controlClass} = this.context;
    labelClass = classNames(labelClass, 'control-label');

    return <div {...this.props} className={className}>
      {label && <label className={labelClass}>{label}</label>}
      {children && <div className={controlClass}>
        {children}
        <CollapseTransitionGroup component="div">
          {contextContent && <div className={`control-label ${contextClass}-message`}>
            {errorMessage(contextContent)}
          </div>}
        </CollapseTransitionGroup>
      </div>}
    </div>;
  }
}

type FormProps = {
  className?: string,
  inline?: boolean,           // use .form-inline
  horizontal?: boolean,       // use .form-horizontal
  labelClass?: string,    // applies to all labels in Groups
  controlClass?: string,  // applies to <div>s wrapping contents of each Group
};

export default class Form extends Component<void,FormProps,void> {
  static childContextTypes = {
    insideForm:       PropTypes.bool,
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
  };
  getChildContext(): Object {
    let {labelClass, controlClass} = this.props;
    return {
      insideForm: true,
      labelClass,
      controlClass
    };
  }
  render(): ReactElement {
    let {className, inline, horizontal} = this.props;
    className = classNames(className, {
      'form-inline':      inline,
      'form-horizontal':  horizontal,
    });
    return <form {...this.props} className={className}/>;
  }
}
