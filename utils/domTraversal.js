function makePredicate(ancestorOrPredicate) {
  if (ancestorOrPredicate instanceof Element) {
    return ancestor => ancestor === ancestorOrPredicate
  }
  return ancestorOrPredicate
}

export function element(el) {
  return {
    isProperDescendantOf(ancestorOrPredicate) {
      let predicate = makePredicate(ancestorOrPredicate)
      let parent = el.parentElement
      while (parent) {
        if (predicate(parent)) return true
        parent = parent.parentElement
      }
      return false
    },
    isDescendantOf(ancestorOrPredicate) {
      let predicate = makePredicate(ancestorOrPredicate)
      return predicate(el) || this.isProperDescendantOf(predicate)
    }
  }
}
