import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export function replaceNonMatching(input: string, pattern: string) {
  return input.replace(new RegExp(`(${pattern})|.`, 'gi'), (match, p1) => p1 || '');
}

export default class RestrictedInput extends Component {
  static propTypes = {
    filterPattern: PropTypes.string,
  };
  onChange = e => {
    let {value} = e.target;
    let {filterPattern} = this.props;
    let restrictedValue = filterPattern ? replaceNonMatching(value, filterPattern) : value;
    if (value !== restrictedValue) {
      e = _.assign({}, e, {
        target: _.assign({}, e.target, {value: restrictedValue}),
      });
    }
    this.props.onChange && this.props.onChange(e);
  };
  render() {
    return <input {...this.props} onChange={this.onChange}/>;
  }
}
