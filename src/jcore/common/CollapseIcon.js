import React from 'react'
import classNames from 'classnames'
import Icon from '../bootstrap/Glyphicon'

import './CollapseIcon.sass'

export default class CollapseIcon extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool,
  };
  render() {
    let {open, className} = this.props
    className = classNames(className, 'collapse-icon', {open})
    return <span {...this.props} className={className}><Icon play /></span>
  }
}
