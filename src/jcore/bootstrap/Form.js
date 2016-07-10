/* @flow */

import React, {Component, Children, PropTypes} from 'react'
import classNames from 'classnames'

import {getFormGroupContextClass, getContextContent} from './bootstrapPropUtils'
import {errorMessage} from '../utils/reactErrorUtils'

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup'

import mapChildrenRecursive from '../utils/mapChildrenRecursive'

type GroupProps = {
  className?: string,
  labelClass?: string,
  controlClass?: string,
  staticControl?: boolean,
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
export class Group extends Component<void, GroupProps, void> {
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
    }
  }
  render(): React.Element {
    let {className, staticControl, label, children, validation} = this.props

    let contextClass   = getFormGroupContextClass(validation || this.props)
    let contextContent = getContextContent       (validation || this.props)

    className = classNames(className, 'form-group', contextClass)

    let labelClass   = classNames(this.context.labelClass,   this.props.labelClass,   'control-label')
    let controlClass = classNames(this.context.controlClass, this.props.controlClass)

    if (staticControl && children) {
      children = Children.map(children, child => child && React.cloneElement(child, {
        className: classNames(child.props.className, 'form-control-static')
      }))
    }

    return <div {...this.props} className={className}>
      {label != null && <label className={labelClass}>{label}</label>}
      {children && <div className={controlClass}>
        {children}
        <CollapseTransitionGroup component="div">
          {contextContent && <div className={`control-label ${contextClass}-message`}>
            {errorMessage(contextContent)}
          </div>}
        </CollapseTransitionGroup>
      </div>}
    </div>
  }
}

type DefaultProps = {
  onSubmit: Function
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

export default class Form extends Component<DefaultProps, FormProps, void> {
  static defaultProps = {
    onSubmit(e) { e.preventDefault() }
  };
  static childContextTypes = {
    insideForm:   PropTypes.bool,   // some components add .form-control class
                                    // when they detect this
    labelClass:   PropTypes.string,
    controlClass: PropTypes.string,
  };
  getChildContext(): Object {
    let {labelClass, controlClass} = this.props
    return {
      insideForm: true,
      labelClass,
      controlClass
    }
  }
  /**
   * Recursively wraps any descendants with a truthy formGroup prop in a <Group>.
   */
  addFormGroups(children: any): any {
    return mapChildrenRecursive(children, child => {
      if (child && child.props && child.props.formGroup) {
        const {formGroup, labelClass, controlClass,
          staticControl, label, contextClass, error, warning, success, validation} = child.props
        const groupProps = {
          ...formGroup || {},
          labelClass, controlClass, staticControl, label,
          contextClass, error, warning, success, validation
        }
        return <Group {...groupProps}>{child}</Group>
      }
      return child
    })
  }
  render(): React.Element {
    let {className, inline, horizontal, children} = this.props
    className = classNames(className, {
      'form-inline':      inline,
      'form-horizontal':  horizontal,
    })
    return <form {...this.props} className={className}>
      {this.addFormGroups(children)}
    </form>
  }
}
