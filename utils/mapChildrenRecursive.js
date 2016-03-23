/* @flow */

import React, {Children} from 'react';

export default function mapChildrenRecursive(children: any, mapper: (child: any, key: any) => any): any {
  let anyChanged = false;
  
  let result = Children.map(children, (child, key) => {
    if (child && child.props) {
      let newGrandchildren = mapChildrenRecursive(child.props.children, mapper);
      if (newGrandchildren !== child.props.children) {
        anyChanged = true;
        child = React.cloneElement(child, {children: newGrandchildren});
      }
    }
    let result = mapper(child, key);
    if (result !== child) {
      anyChanged = true;
    }
    return result;
  });
  
  return anyChanged ? result : children;
}
