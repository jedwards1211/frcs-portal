import Immutable from 'immutable';

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
