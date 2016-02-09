import React from 'react';
import Immutable from 'immutable';
import shallowEqual from 'fbjs/lib/shallowEqual';
import Tree from './Tree.jsx';
import _ from 'lodash';

export function forEachNode(tree, iteratee) {
  function helper(root, path) {
    if (iteratee(root, path) === false) return false;

    let children = root.get('children');
    if (children) {
      let abort = false;
      children.forEach((child, key) => {
        let result = helper(child, [...path, 'children', key])
        if (result === false) {
          abort = true;
        }
        return result;
      });
      if (abort) {
        return false;
      }
    }
  }
  if (tree) helper(tree, []);
}

export function updateEachNode(tree, iteratee) {
  function helper(tree, path) {
    return tree && tree.withMutations(tree => {
      const nextTree = iteratee(tree, path);
      if (nextTree instanceof Immutable.Iterable) {
        return nextTree.update('children', children => children && children.map(
          (child, key) => helper(child, [...path, 'children', key])));
      }
      return nextTree;
    });
  }

  return helper(tree, []);
}

/**
 * Merges values from nodes in oldTree into the corresponding nodes in newTree that don't contain a
 * value for a given key.
 * @param oldTree
 * @param newTree
 * @returns {*|Iterable|Array}
 */
export function updateTree(oldTree, newTree) {
  if (!oldTree) return newTree;
  return newTree.map((newValue, key) => {
    let oldValue = oldTree.get(key);
    if (key === 'children') {
      return newValue.map((newChild, key) => {
        updateTree(oldValue && oldValue.get(key), newChild)
      });
    }
    else {
      return newValue || oldValue;
    }
  });
}

export function interleaveChildren(path) {
  return _.flatten(path.map(elem => ['children', elem]));
}

export function expandTreePath(model, path) {
  return model && model.withMutations(model => {
    if (model.get('children')) {
      model.set('expanded', true);
    }
    if (path.length) {
      model.update(path[0], child => expandTreePath(child, path.slice(1)));
    }
  });
}

export const FastTreeAdapter = {
  shouldUpdate(oldNode, newNode) { return !shallowEqual(oldNode, newNode); },
  hasChildren(node) {
    let children = node.get("children");
    return !!(children && children.size);
  },
  mapChildren(node, iteratee) {
    let children = node.get('children');
    if (children) return children.map(iteratee).toArray();
  },
  isExpanded(node) { return !!node.get("expanded"); },
  isSelected(node) { return !!node.get("selected"); },
  render(node, props) {
    let selected = this.isSelected(node),
        expanded = this.isExpanded(node),
        children = this.hasChildren(node);

    return <Tree.Cell {...props} selected={selected} expanded={expanded} hasChildren={!!children}>
      {node.get('value')}
    </Tree.Cell>;
  },
};
