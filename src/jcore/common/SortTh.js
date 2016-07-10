/* @flow */

import React from 'react'
import Glyphicon from '../bootstrap/Glyphicon'
import _ from 'lodash'

type OrderBy = {[field: string]: 'asc' | 'desc'};

type Props = {
  style?: Object,
  field: string,
  orderBy?: OrderBy,
  orderByMaxSize?: number,
  onOrderByChange?: (orderBy: OrderBy) => any,
  children: any
};

const SortTh: (props: Props) => React.Element = props => {
  let {field, children, style} = props
  let orderBy = props.orderBy || {}

  const onClick = () => {
    let {onOrderByChange, orderByMaxSize} = props
    orderByMaxSize = orderByMaxSize || 1
    if (onOrderByChange) {
      let oldOrderBy = props.orderBy || {}
      let orderBy = {}
      switch (oldOrderBy[field]) {
      case 'asc':   orderBy[field] = 'desc'; break
      case 'desc':  break
      default:      orderBy[field] = 'asc'; break
      }
      let size = 1
      for (let otherField in oldOrderBy) {
        if (size >= orderByMaxSize) break
        if (otherField !== field) {
          orderBy[otherField] = oldOrderBy[otherField]
          size++
        }
      }
      onOrderByChange(orderBy)
    }
  }

  let sortIndex = 0
  for (let otherField in orderBy) {
    if (otherField === field) break
    sortIndex++
  }

  let iconStyle = {
    opacity: 1 - sortIndex / _.size(orderBy)
  }

  let icon
  switch (orderBy[field]) {
  case 'asc':  icon = <Glyphicon triangleTop     style={iconStyle} />; break
  case 'desc': icon = <Glyphicon triangleBottom  style={iconStyle} />; break
  }

  style = Object.assign(style || {}, {
    cursor: 'pointer'
  })

  return <th onClick={onClick} style={style}>
    {icon} {children}
  </th>
}

export default SortTh
