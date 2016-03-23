/* @flow */

import React, {Component} from 'react';
import _ from 'lodash';

import Form from '../bootstrap/Form.jsx';

import mapChildrenRecursive from '../utils/mapChildrenRecursive';

import type {Dispatch} from '../flowtypes/reduxTypes';
import type {FormValidation} from '../flowtypes/validationTypes';

type Props = {
  onAutoformFieldChange?: (field: string, newValue: any) => any,
  validation?: FormValidation,
  disabled?: boolean,
  children?: any,
};

/**
 * For starters, use this just like Form: any children you give a formGroup property
 * will be magically turned into a form control inside a form group (with a label
 * if you put a label property on the child).
 *
 * Then, if you give any children a "field" property, it will clone those children with
 * value={this.props[field]} (where this is the Autoform), onChange that calls the corresponding
 * handler from this.props with the new value (e.g. for field="fullName", onChange will call
 * this.props.onFullNameChange).  If the child component has a static formGroupValueProp property,
 * that will be used instead of "value".
 * The onChange handler will also call onAutoformFieldChange(field, newValue).
 * If you give the child an "eventName" prop, it will pass the handler for that prop instead of "onChange".
 *
 * Pass in onAutoformFieldChange={dispatchAutoformFieldChange(...)} to automatically create and dispatch
 * the appropriate redux actions when a given field changes (e.g. for field="fullName", a SET_FULL_NAME
 * action will be dispatched).  dispatchAutoformFieldChange can be configured with an action type prefix
 * and custom meta as well.
 *
 * You may also tag buttons with autoformToggleButton to bind their field to their active and onClick props.
 */
export default class Autoform extends Component<void,Props,void> {
  bindFields(children: any): any {
    let {onAutoformFieldChange, validation, disabled} = this.props;

    return mapChildrenRecursive(children, child => {
      if (child && child.props) {
        if (child.props.autoformToggleButton) {
          let {field, onClick} = child.props;
          let eventHandler = this.props[child.props.eventName || `on${_.upperFirst(field)}Change`];
          let valueProp = child.type.formControlValueProp || child.props.valueProp || 'active';

          return React.cloneElement(child, {
            disabled,
            [valueProp]: this.props[field],
            validation: validation && validation[field],
            onClick: (e) => {
              let newValue = !this.props[field];
              onClick && onClick(e);
              eventHandler && eventHandler(newValue);
              onAutoformFieldChange && onAutoformFieldChange(field, newValue);
            }
          });
        }
        if (child.props.formGroup || child.props.autoformGroup) {
          let {field, staticControl, readOnly, onChange} = child.props;
          if (field && !staticControl && !readOnly) {
            let eventHandler = this.props[child.props.eventName || `on${_.upperFirst(field)}Change`];
            let valueProp = child.type.formControlValueProp || child.props.valueProp || 'value';

            return React.cloneElement(child, {
              disabled,
              [valueProp]: this.props[field],
              validation: validation && validation[field],
              onChange: (e:any) => {
                let newValue = e;
                if (e && e.target && 'value' in e.target) {
                  newValue = e.target.value;
                }
                onChange && onChange(newValue);
                eventHandler && eventHandler(newValue);
                onAutoformFieldChange && onAutoformFieldChange(field, newValue);
              }
            });
          }
        }
      }
      return child;
    });
  }
  render(): ReactElement {
    return <Form {...this.props}>
      {this.bindFields(this.props.children)}
    </Form>;
  }
}

/**
 * Creates an onAutoformFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched
 * options.typePrefix: string to prepend to the generated action types.  For instance for field="fullName"
 * and option.typePrefix = "EMPLOYEE.", when the fullName field changes this will dispatch an EMPLOYEE.SET_FULL_NAME
 * action.
 */
export function dispatchAutoformFieldChanges(dispatch: Dispatch, options?: {meta?: Object, typePrefix?: string})
  : (field: string, newValue: any) => void {
  let meta = options && options.meta;
  let typePrefix = (options && options.typePrefix) || '';
  return (field, newValue) => dispatch({
    type: typePrefix + 'SET_' + _.snakeCase(field).toUpperCase(),
    payload: newValue,
    meta
  });
}
