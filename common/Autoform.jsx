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
  children?: any,         // any descendants with a truthy "formGroup" prop will be
                          // wrapped in a <Group>
};

export default class Autoform extends Component<void,Props,void> {
  bindFields(children: any): any {
    let {onAutoformFieldChange, validation, disabled} = this.props;

    return mapChildrenRecursive(children, child => {
      if (child && child.props && child.props.formGroup) {
        let {field, staticControl, readOnly, onChange} = child.props;
        if (field && !staticControl && !readOnly) {
          let eventHandler = this.props[child.props.eventName || `on${_.upperFirst(field)}Change`];
          let valueProp = child.type.formControlValueProp || 'value';
          
          return React.cloneElement(child, {
            disabled,
            [valueProp]: this.props[field],
            validation: validation && validation[field],
            onChange: (e: any) => {
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
      return child;
    });
  }
  render(): ReactElement {
    return <Form {...this.props}>
      {this.bindFields(this.props.children)}
    </Form>;
  }
}

export function dispatchAutoformFieldChange(dispatch: Dispatch, options?: {meta?: Object, typePrefix?: string})
  : (field: string, newValue: any) => void {
  let meta = options && options.meta;
  let typePrefix = (options && options.typePrefix) || '';
  return (field, newValue) => dispatch({
    type: typePrefix + 'set' + _.kebabCase(field).toUpperCase(),
    payload: newValue,
    meta
  });
}
