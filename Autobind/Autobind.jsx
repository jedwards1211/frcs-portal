/* @flow */

import React, {Component, Children} from 'react';
import _ from 'lodash';
import warning from './warning';

import type {Key, MixedObj} from '../flowtypes/commonTypes';
import type {OnAutobindFieldChange} from './AutobindTypes';

type DefaultProps = {
  data: Object,
  callbacks: Object
};

type Props = {
  data: MixedObj | mixed[],
  metadata?: MixedObj,
  omnidata?: MixedObj,
  callbacks: {
    onAutobindFieldChange?: OnAutobindFieldChange,
    [key: Key]: (newValue: mixed) => any
  },
  children?: mixed,
};

export default class Autobind extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    data: {},
    callbacks: {}
  };
  bindFields(children: any, path?: mixed[] = []): any {
    let {data, metadata, omnidata, callbacks} = this.props;
    let onAutobindFieldChange = callbacks.onAutobindFieldChange || _.noop;

    return Children.map(children, (child: mixed) => {
      if (child instanceof Object && child.props) {
        let {children, autobindPath, autobindField, autobindProps} = (child.props: MixedObj);

        warning(autobindField == null || typeof autobindField === 'string' || typeof autobindField === 'number', 
          "props.autobindField should be a string or number in descendant: ", child);
        
        let childPath = autobindPath instanceof Array || autobindPath != null ?
          path.concat(autobindPath) : path;

        let newProps = {};
        Object.assign(newProps, omnidata);

        if (autobindField || autobindProps) {
          if (autobindField) {
            autobindProps = Object.assign({}, autobindProps, {value: autobindField});
          }

          if (!(autobindProps instanceof Object)) {
            warning(true, "props.autobindProps is not an Object in descendant: ", child);
          }
          else {
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
              newProps[callbackProp] = (e: mixed) => {
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
