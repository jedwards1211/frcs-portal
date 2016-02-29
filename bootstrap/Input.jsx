/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';

const classNameForType = {
  email:    'form-control',
  month:    'form-control',
  number:   'form-control',
  password: 'form-control',
  range:    'form-control',
  search:   'form-control',
  tel:      'form-control',
  text:     'form-control',
  url:      'form-control'
};

type Props = {
  className?: string,
  type?: string
};

export default class Input extends Component<void,Props,void> {
  root: HTMLImageElement;
  focus(): void {
    this.root.focus();
  }
  render(): ReactElement {
    let {className, type} = this.props;
    className = classNames(className, type && classNameForType[type]);
    return <input {...this.props} className={className} ref={c => this.root = c}/>;
  }
}
