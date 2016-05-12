/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'

import {getSizingClass} from './bootstrapPropUtils'

type Props = {
  className?: string,
  sm?: boolean,
  small?: boolean,
  lg?: boolean,
  large?: boolean,
  sizing?: 'sm' | 'small' | 'lg' | 'large',
  children?: any,
};

export default class Well extends Component<void, Props, void> {
  render(): React.Element {
    let sizingClass = getSizingClass(this.props)
    let className = classNames(this.props.className, 'well', sizingClass && 'well-' + sizingClass)
    return <div {...this.props} className={className} />
  }
}
