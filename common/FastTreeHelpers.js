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
  helper(tree, []);
}

export function expandTreePath(model, path) {
  return model.withMutations(model => {
    if (model.get('children')) {
      model.set('expanded', true);
    }
    if (path.length) {
      model.update(path[0], child => expandTreePath(child, path.slice(1)));
    }
  });
}
