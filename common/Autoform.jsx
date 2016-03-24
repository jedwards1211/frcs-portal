/* @flow */

import React, {Component} from 'react';
import _ from 'lodash';

import Form from '../bootstrap/Form.jsx';

import mapChildrenRecursive from '../utils/mapChildrenRecursive';

import type {Dispatch} from '../flowtypes/reduxTypes';
import type {FormValidation} from '../flowtypes/validationTypes';

type Props = {
  onAutoformFieldChange?: (autoformField: string, newValue: any) => any | (key: any, autoformField: string, newValue: any) => any,
  onAutoformEvent?: (event: string) => any | (key: any, event: string) => any,
  bare?: boolean,
  documentId?: any,
  validation?: FormValidation,
  disabled?: boolean,
  children?: any,
};

/**
 * For starters, use this just like Form: any children you give a formGroup property
 * will be magically turned into a form control inside a form group (with a label
 * if you put a label property on the child).
 *
 * Then, if you give any children a "autoformField" property, it will clone those children with
 * value={this.props[autoformField]} (where this is the Autoform), onChange that calls the corresponding
 * handler from this.props with the new value (e.g. for autoformField="fullName", onChange will call
 * this.props.onFullNameChange).  If the child component has a static formGroupValueProp property,
 * that will be used instead of "value".
 * The onChange handler will also call onAutoformFieldChange(autoformField, newValue).
 * If you give the child an "eventName" prop, it will pass the handler for that prop instead of "onChange".
 *
 * Pass in onAutoformFieldChange={dispatchAutoformFieldChange(...)} to automatically create and dispatch
 * the appropriate redux actions when a given autoformField changes (e.g. for autoformField="fullName", a SET_FULL_NAME
 * action will be dispatched).  dispatchAutoformFieldChange can be configured with an action type prefix
 * and custom meta as well.
 */
export default class Autoform extends Component<void,Props,void> {
  bindFields(children: any): any {
    let {onAutoformFieldChange, onAutoformEvent, validation, disabled, documentId} = this.props;

    return mapChildrenRecursive(children, child => {
      if (child && child.props) {
        if (child.props.autoformField) {
          let {autoformField, onChange, autoformEvent, autoformValueProp} = child.props;
          let eventHandler = this.props[autoformEvent || `on${_.upperFirst(autoformField)}Change`];
          let valueProp = autoformValueProp || child.type.autoformValueProp || 'value';

          return React.cloneElement(child, {
            disabled,
            [valueProp]: this.props[autoformField],
            validation: validation && validation[autoformField],
            onChange: (e:any) => {
              let newValue = e;
              if (e && e.target && 'value' in e.target) {
                newValue = e.target.value;
              }
              if (documentId !== undefined && documentId !== null) {
                onChange && onChange(documentId, newValue);
                eventHandler && eventHandler(documentId, newValue);
                onAutoformFieldChange && onAutoformFieldChange(documentId, autoformField, newValue);
              }
              else {
                onChange && onChange(newValue);
                eventHandler && eventHandler(newValue);
                onAutoformFieldChange && onAutoformFieldChange(autoformField, newValue);
              }
            }
          });
        }
        else if (child.props.autoformEvent) {
          let {autoformEvent, onClick} = child.props;
          let eventHandler = this.props[autoformEvent];

          return React.cloneElement(child, {
            disabled,
            onClick: (e: any) => {
              onClick && onClick(e);
              if (documentId !== undefined && documentId !== null) {
                eventHandler && eventHandler(documentId);
                onAutoformEvent && onAutoformEvent(documentId, autoformEvent);
              }
              else {
                eventHandler && eventHandler();
                onAutoformEvent && onAutoformEvent(autoformEvent);
              }
            }
          });
        }
      }
      return child;
    },
    child => child.type !== Autoform);
  }
  render(): ReactElement {
    let {bare, children} = this.props;

    let bound = this.bindFields(children);
    
    if (bare) {
      if (bound instanceof Array) {
        return bound[0];
      }
      return bound;
    }

    return <Form {...this.props}>{bound}</Form>;
  }
}

/**
 * Creates an onAutoformFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched
 * options.typePrefix: string to prepend to the generated action types.  For instance for autoformField="fullName"
 * and option.typePrefix = "EMPLOYEE.", when the fullName autoformField changes this will dispatch an EMPLOYEE.SET_FULL_NAME
 * action.
 */
export function dispatchAutoformFieldChanges(dispatch: Dispatch, options?: {meta?: Object, typePrefix?: string})
  : (autoformField: string, newValue: any) => void {
  let meta = options && options.meta;
  let typePrefix = (options && options.typePrefix) || '';
  return (autoformField, newValue) => dispatch({
    type: typePrefix + 'SET_' + _.snakeCase(autoformField).toUpperCase(),
    payload: newValue,
    meta
  });
}
