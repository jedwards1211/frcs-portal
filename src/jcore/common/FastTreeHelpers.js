import React from 'react'
import * as Immutable from 'immutable'
import _ from 'lodash'

import {Node} from './TreeModel'

export function forEachNode(tree, iteratee) {
  function helper(root, path) {
    if (iteratee(root, path) === false) return false

    let children = root.get('children')
    if (children) {
      let abort = false
      children.forEach((child, key) => {
        let result = helper(child, [...path, 'children', key])
        if (result === false) {
          abort = true
        }
        return result
      })
      if (abort) {
        return false
      }
    }
  }
  if (tree) helper(tree, [])
}

export function updateEachNode(tree, iteratee) {
  function helper(tree, path) {
    return tree && tree.withMutations(tree => {
      const nextTree = iteratee(tree, path)
      if (nextTree instanceof Immutable.Iterable) {
        return nextTree.update('children', children => children && children.map(
          (child, key) => helper(child, [...path, 'children', key])))
      }
      return nextTree
    })
  }

  return helper(tree, [])
}

/**
 * Merges values from nodes in oldTree into the corresponding nodes in newTree that don't contain a
 * value for a given key.
 * @param oldTree
 * @param newTree
 * @returns {*|Iterable|Array}
 */
export function updateTree(oldTree, newTree) {
  if (!oldTree) return newTree
  return newTree.map((newValue, key) => {
    let oldValue = oldTree.get(key)
    if (key === 'children') {
      return newValue.map((newChild, key) => {
        updateTree(oldValue && oldValue.get(key), newChild)
      })
    }
    else {
      return newValue || oldValue
    }
  })
}

export function interleaveChildren(path) {
  return _.flatten(path.map(elem => ['children', elem]))
}

export function expandTreePath(model, path) {
  return model && model.withMutations(model => {
    if (model.get('children')) {
      model.set('expanded', true)
    }
    if (path.length) {
      model.update(path[0], child => expandTreePath(child, path.slice(1)))
    }
  })
}

export class FastTreeNode extends Node {
  constructor(parent, key, data, model) {
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
  shouldUpdate(newNode) {
    return newNode.data !== this.data || newNode.model !== this.model
  }
  hasChildren() {
    let children = this.data.get('children')
    return !!children && children.size
  }
  createChildren() {
    let _children = this.data.get('children')
    if (!_children) return {}
    _children = _children.map((child, key) => new FastTreeNode(this, key, child, this.model))
    return _children.toObject()
  }
  isExpanded() { return !!this.data.get('expanded') }
  isSelected() { return !!this.data.get('selected') }
}
