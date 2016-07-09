/* @flow */

import _ from 'lodash'

export class Node {
  parent: any;
  key: ?string | ?number;
  _cachedChildren: any;

  constructor(parent?: any, key?: string | number) {
    this.parent = parent
    this.key = key
  }
  shouldUpdate(newNode: any): boolean { return newNode !== this }
  children(): any {
    if (!this._cachedChildren) {
      if (this.createChildren) {
        this._cachedChildren = this.createChildren()
      }
      else {
        this._cachedChildren = []
      }
    }
    return this._cachedChildren
  }
  hasChildren(): boolean { return _.size(this.children()) > 0 }
  isExpanded(): boolean { return false }
  getPath(): Array<string | number> {
    if (this.parent) {
      if (this.key !== undefined && this.key !== null) {
        return this.parent.getPath().concat(this.key)
      }
      return this.parent.getPath()
    }
    return []
  }
  getIn(path: Array<string | number>, index?: number = 0): ?Node {
    if (index === path.length) {
      return this
    }
    let child = this.children()[path[index]]
    return child && child.getIn(path, index + 1)
  }
}

export class BasicNode extends Node {
  data: any;
  model: any;

  constructor(parent?: any, key?: string | number, data: any, model: any) {
    super(arguments.length > 2 ? parent : undefined, arguments.length > 2 ? key : undefined)
    if (arguments.length <= 2) {
      this.data = arguments[0]
      this.model = arguments[1]
    }
    else {
      this.data = data
      this.model = model
    }
  }
  shouldUpdate(newNode: any): boolean {
    return this.data !== newNode.data || this.model !== newNode.model
  }
  hasChildren(): boolean {
    return _.size(this.data.children) > 0
  }
  createChildren(): any {
    return _.map(this.data.children || [], (child, key) => new BasicNode(this, key, child, this.model))
  }
  isExpanded(): boolean { return !!this.data.expanded }
  isSelected(): boolean { return !!this.data.selected }
}
