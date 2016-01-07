export function element(el) {
  return {
    isProperDescendantOf(ancestor) {
      let parent = el.parentElement;
      while (parent) {
        if (parent === ancestor) return true;
        parent = parent.parentElement;
      }
      return false;
    },
    isDescendantOf(ancestor) {
      return el === ancestor || this.isProperDescendantOf(ancestor);
    }
  };
}
