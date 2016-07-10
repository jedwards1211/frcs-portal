import React from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import propAssign from '../utils/propAssign'

import './Glyphicon.sass'

const EXCLUDED_PROPS = [
  'className',
  'style',
  'float',
  'onClick',
]

export default props => {
  let otherProps = _.pick(props, EXCLUDED_PROPS)
  let className = classNames(props.className, 'glyphicon',
    _.mapKeys(_.omit(props, EXCLUDED_PROPS), (val, prop) => val ? prop && 'glyphicon-' + _.kebabCase(prop) : ''))
  otherProps.style = propAssign(otherProps.style, {float: props.float})
  return <i {...otherProps} className={className} />
}
