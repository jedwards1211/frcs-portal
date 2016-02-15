/* @flow */

import React, {Component} from 'react';

export function replaceNonMatching(input: string, pattern: string): string {
  return input.replace(new RegExp(`(${pattern})|.`, 'gi'), (match, p1) => p1 || '');
}

export function restrictDecimalNumber(input: string): string {
  let decimalIndex = input.indexOf('.');
  if (decimalIndex >= 0) {
    return  restrictDecimalNumber(input.substring(0, decimalIndex )) + '.' +
            input.substring(decimalIndex + 1).replace(/\D/g, '');
  }
  let negative = /^\s*-/.test(input);
  let result = input.replace(/\D/g, '');
  return negative ? '-' + result : result;
}

type Props = {
  restrictValue?: (value: string) => string,
  filterPattern?: string,
  decimalNumber?: boolean,
  value?: string,
};

export default class RestrictedInput extends Component<void,Props,void> {
  onChange: (e: {target: {value: ?string}}) => void = e => {
    let {value} = e.target;
    value = value || '';
    let {restrictValue, filterPattern, decimalNumber} = this.props;
    let restrictedValue = restrictValue ? restrictValue(value) :
                          filterPattern ? replaceNonMatching(value, filterPattern) :
                          decimalNumber ? restrictDecimalNumber(value) :
                          value;
    if (this.props.value !== restrictedValue) {
      e = Object.assign({}, e, {
        target: Object.assign({}, e.target, {value: restrictedValue}),
      });
      this.props.onChange && this.props.onChange(e);
    }
  };
  render(): ReactElement {
    return <input {...this.props} onChange={this.onChange}/>;
  }
}
