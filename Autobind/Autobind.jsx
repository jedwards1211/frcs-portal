/* @flow */

import React, {Component, Children} from 'react';
import _ from 'lodash';
import warning from './warning';

import type {OnAutobindFieldChange} from './AutobindTypes';

type DefaultProps = {
  data: Object,
  callbacks: Object
};

type Props = {
  data: Object | Array<any>,
  metadata?: Object,
  omnidata?: Object,
  callbacks: {
    onAutobindFieldChange?: OnAutobindFieldChange,
    [key: string | number]: (newValue: any) => any
  },
  children?: any,
};

export default class Autobind extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    data: {},
    callbacks: {}
  };
  bindFields(children: any, path?: Array<string | number> = []): any {
    let {data, metadata, omnidata, callbacks} = this.props;
    let onAutobindFieldChange = callbacks.onAutobindFieldChange || _.noop;

    return Children.map(children, child => {
      if (child && child.props) {
        let {children, autobindPath, autobindField, autobindProps} = child.props;

        warning(autobindField == null || typeof autobindField === 'string' || typeof autobindField === 'number', 
          "props.autobindField should be a string or number in descendant: ", child);
        warning(autobindProps == null || autobindProps instanceof Object, "props.autobindProps is not an Object in descendant: ", child);

        let childPath = autobindPath != null ? path.concat(autobindPath) : path;

        let newProps = {};
        Object.assign(newProps, omnidata);

        if (autobindField || autobindProps) {
          if (autobindField) {
            autobindProps = Object.assign({}, autobindProps, {value: autobindField});
          }

          for (let prop in autobindProps) {
            let autobindField = autobindProps[prop];
            let callbackProp = prop === 'value' ? 'onChange' : `on${_.upperFirst(prop)}Change`;
            let wrappedCallback = child.props[callbackProp];
            let rootCallback = callbacks[`on${_.upperFirst(autobindField)}Change`];

            warning(typeof autobindField === 'string' || typeof autobindField === 'number', 
              `props.autobindProps[${JSON.stringify(prop)}] is not a string or number in descendant: `, child);
            warning(rootCallback == null || rootCallback instanceof Function,
              `props['${callbackProp}'] is not a Function in descendant: `, child);

            wrappedCallback = wrappedCallback || _.noop;
            rootCallback = rootCallback || _.noop;

            let fieldPath = [...childPath, autobindField];

            for (let prop in metadata) {
              let metadataProp = _.get(metadata[prop], fieldPath);
              if (metadataProp != null) newProps[prop] = metadataProp;
            }
            newProps[prop] = _.get(data, fieldPath);
            newProps[callbackProp] = (e: any) => {
              let newValue = e;
              if (e && e.target && 'value' in e.target) {
                newValue = e.target.value;
              }
              if (childPath.length) {
                let options = {autobindPath: childPath};
                wrappedCallback(newValue, options);
                rootCallback(newValue, options);
                onAutobindFieldChange(autobindField, newValue, options);
              }
              else {
                wrappedCallback(newValue);
                rootCallback(newValue);
                onAutobindFieldChange(autobindField, newValue);
              }
            };
          }
        }

        newProps.children = this.bindFields(children, childPath);

        return React.cloneElement(child, newProps);
      }
      return child;
    });
  }
  render(): ReactElement {
    return this.bindFields(this.props.children)[0];
  }
}
