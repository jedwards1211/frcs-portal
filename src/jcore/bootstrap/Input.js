/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
import {getSizingClass} from './bootstrapPropUtils'

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
}

type Props = {
  className?: string,
  type?: string,
  lg?: boolean,
  sm?: boolean,
  large?: boolean,
  small?: boolean,
  size?: 'lg' | 'sm' | 'large' | 'small',
  onKeyDown?: (e: any) => any,
  onEnterDown?: (e: any) => any,
};

export default class Input extends Component<void, Props, void> {
  static supportsInputGroupInput = true;
  root:HTMLImageElement;

  focus():void {
    this.root.focus()
  }

  onKeyDown: (e: any) => any = e => {
    let {onKeyDown, onEnterDown} = this.props
    onKeyDown && onKeyDown(e)
    if (e.key === 'Enter') {
      onEnterDown && onEnterDown(e)
    }
  };

  render():React.Element {
    let {className, type} = this.props
    let sizingClass = getSizingClass(this.props)
    className = classNames(className, type && classNameForType[type], sizingClass && 'input-' + sizingClass)
    return <input {...this.props} className={className} ref={c => this.root = c} onKeyDown={this.onKeyDown} />
  }
}
