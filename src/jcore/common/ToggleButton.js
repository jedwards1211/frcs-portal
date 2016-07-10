/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'

import Button from '../bootstrap/Button'
import type {Props as ButtonProps} from '../bootstrap/Button'

type Props = ButtonProps & {
  value?: boolean,
  onChange?: (value: boolean) => any
};

export default class ToggleButton extends Component<void, Props, void> {
  static supportsInputGroupBtn = true;
  render(): React.Element {
    let {className, value, onChange} = this.props
    className = classNames(className, {active: value})
    return <Button {...this.props} className={className} onClick={() => onChange && onChange(!value)} />
  }
}
