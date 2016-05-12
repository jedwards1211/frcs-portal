/* @flow */

import React from 'react'
import classNames from 'classnames'

export default (props: Object): React.Element => {
  let {className} = props
  className = classNames(className, 'badge')
  return <span {...props} className={className} />
}
