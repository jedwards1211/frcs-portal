/* @flow */

import React, {Component, Children} from 'react';
import _ from 'lodash';

import Form from '../bootstrap/Form.jsx';

import type {Dispatch} from '../flowtypes/reduxTypes';
import type {FormValidation} from '../flowtypes/validationTypes';

type AutoformFieldChangeCallback =
  (autoformField: string, newValue: any, options?: {autoformPath?: Array<string | number>}) => any;

type Props = {
  onAutoformFieldChange?: AutoformFieldChangeCallback,
  bare?: boolean,
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
  bindFields(children: any, path?: Array<string | number> = []): any {
    let {onAutoformFieldChange, validation, disabled} = this.props;

    return Children.map(children, child => {
      if (child && child.props) {
        let {children, autoformPath, autoformField} = child.props;
        let childPath = autoformPath !== null && autoformPath !== undefined ? path.concat(autoformPath) : path;
        
        if (autoformField) {
          let {onChange, autoformEvent, autoformValueProp} = child.props;
          
          let eventHandler = this.props[autoformEvent || `on${_.upperFirst(autoformField)}Change`];
          let valueProp = autoformValueProp || child.type.autoformValueProp || 'value';

          return React.cloneElement(child, {
            disabled,
            [valueProp]: _.get(this.props, [...childPath, autoformField]),
            validation:  _.get(validation, [...childPath, autoformField]),
            onChange: (e:any) => {
              let newValue = e;
              if (e && e.target && 'value' in e.target) {
                newValue = e.target.value;
              }
              let options;
              if (childPath.length) {
                options = {autoformPath: childPath};
              }
              onChange && onChange(newValue, options);
              eventHandler && eventHandler(newValue, options);
              onAutoformFieldChange && onAutoformFieldChange(autoformField, newValue, options);
            },
            children: this.bindFields(children, childPath)
          });
        }

        let newChildren = this.bindFields(children, childPath);
        if (newChildren !== children) {
          return React.cloneElement(child, {children: newChildren});
        }
      }
      return child;
    });
  }
  render(): ReactElement {
    let {bare, children} = this.props;

    let boundChildren = this.bindFields(children);
    
    if (bare) {
      if (boundChildren instanceof Array) {
        return boundChildren[0];
      }
      return boundChildren;
    }

    return <Form {...this.props}>{boundChildren}</Form>;
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
  : AutoformFieldChangeCallback {
  let meta = options && options.meta;
  let typePrefix = (options && options.typePrefix) || '';
  return (autoformField, newValue, options) => {
    let {autoformPath} = options || {};
    dispatch({
      type: typePrefix + 'SET_' + _.snakeCase(autoformField).toUpperCase(),
      payload: newValue,
      meta: meta && autoformPath ? {...meta, autoformPath} : meta
    });
  }
}
