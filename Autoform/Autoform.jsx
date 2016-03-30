/* @flow */

import React, {Component, Children} from 'react';
import _ from 'lodash';

import Form from '../bootstrap/Form.jsx';

import type {FormValidation} from '../flowtypes/validationTypes';
import type {AutoformFieldChangeCallback} from './AutoformTypes';

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

        let autoformProps: {[prop: string]: string} = child.props.autoformProps || {};
        if (autoformField) {
          autoformProps = {...autoformProps, value: autoformField};
        }

        let newProps: Object = {
          disabled: disabled || child.props.disabled,
          children: this.bindFields(children, childPath)
        };

        _.forEach(autoformProps, (autoformField, prop) => {
          let {onChange, autoformEvent} = child.props;

          let callbackProp = prop === 'value' ? 'onChange' : `on${_.upperFirst(autoformField)}Change`;
          let eventHandler = this.props[autoformEvent || `on${_.upperFirst(autoformField)}Change`];

          let actualProp = prop;
          if (prop === 'value') {
            actualProp = child.type.autoformValueProp || 'value';
            newProps.validation =  _.get(validation, [...childPath, autoformField]);
          }

          Object.assign(newProps, {
            [actualProp]: _.get(this.props, [...childPath, autoformField]),
            [callbackProp]: (e:any) => {
              let newValue = e;
              if (e && e.target && 'value' in e.target) {
                newValue = e.target.value;
              }
              let options;
              if (childPath.length) {
                options = {autoformPath: childPath};
              }
              prop === 'value' && onChange && onChange(newValue, options);
              eventHandler && eventHandler(newValue, options);
              onAutoformFieldChange && onAutoformFieldChange(autoformField, newValue, options);
            }
          });
        });

        return React.cloneElement(child, newProps);
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
