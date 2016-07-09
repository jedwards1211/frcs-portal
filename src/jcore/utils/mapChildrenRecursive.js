/* @flow */

import React, {Children} from 'react'

/**
 * Like React.Children.map, but works recursively on all descendants.
 */
export default function mapChildrenRecursive(children: any, mapper: (child: any, key: any) => any,
                                             filter?: (child: any, key: any) => boolean): any {
  let anyChanged = false

  let result = Children.map(children, (child, key) => {
    if (filter && !filter(child, key)) return child

    if (child && child.props) {
      let newGrandchildren = mapChildrenRecursive(child.props.children, mapper)
      if (newGrandchildren !== child.props.children) {
        anyChanged = true
        child = React.cloneElement(child, {children: newGrandchildren})
      }
    }
    let result = mapper(child, key)
    if (result !== child) {
      anyChanged = true
    }
    return result
  })

  return anyChanged ? result : children
}
