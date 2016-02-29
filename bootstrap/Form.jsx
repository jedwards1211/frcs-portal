/* @flow */

import React, {Component, Children, PropTypes} from 'react';
import classNames from 'classnames';

import {getFormGroupContextClass, getContextContent} from './bootstrapPropUtils';
import {errorMessage} from '../utils/reactErrorUtils';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup.jsx';

type GroupProps = {
  className?: string,
  labelClass?: string,
  controlClass?: string,
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

/**
 * Wrapper for a .form-group div.  You specify the label in the "label" prop,
 * and the control(s) in the children.  If you add a truthy "formGroup" prop to any
 * descendants of Form, it will wrap them in a <Group>, so you should rarely
 * need to use this directly.
 */
export class Group extends Component<void,GroupProps,void> {
  static contextTypes = {
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
  };
  static childContextTypes = {
    insideFormGroup: PropTypes.bool,
  };
  getChildContext(): Object {
    return {
      insideFormGroup: true
    };
  }
  render(): ReactElement {
    let {className, label, children, validation} = this.props;

    let contextClass   = getFormGroupContextClass(validation || this.props);
    let contextContent = getContextContent       (validation || this.props);

    className = classNames(className, 'form-group', contextClass && 'has-' + contextClass);

    let labelClass   = classNames(this.context.labelClass,   this.props.labelClass,   'control-label');
    let controlClass = classNames(this.context.controlClass, this.props.controlClass);

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
  inline?: boolean,       // use .form-inline
  horizontal?: boolean,   // use .form-horizontal
  labelClass?: string,    // applies to all labels in Groups
  controlClass?: string,  // applies to <div>s wrapping contents of each Group
  children?: any,         // any descendants with a truthy "formGroup" prop will be
                          // wrapped in a <Group>
};

export default class Form extends Component<void,FormProps,void> {
  static childContextTypes = {
    insideForm:   PropTypes.bool,   // some components add .form-control class
                                    // when they detect this
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
  /**
   * Recursively wraps any descendants with a truthy formGroup prop in a <Group>.
   */
  addFormGroups(children: any): any {
    let anyChanged = false;
    let newChildren = Children.map(children, child => {
      if (child && child.props) {
        if (child.props.formGroup) {
          anyChanged = true;
          return <Group {...child.props} className={undefined}>
            {child}
          </Group>;
        }
        else if (child.props.children) {
          let newGrandchildren = this.addFormGroups(child.props.children);
          if (newGrandchildren !== child.props.children) {
            anyChanged = true;
            return React.cloneElement(child, {children: newGrandchildren});
          }
        }
      }
      return child;
    });
    return anyChanged ? newChildren : children;
  }
  render(): ReactElement {
    let {className, inline, horizontal, children} = this.props;
    className = classNames(className, {
      'form-inline':      inline,
      'form-horizontal':  horizontal,
    });
    return <form {...this.props} className={className}>
      {this.addFormGroups(children)}
    </form>;
  }
}
