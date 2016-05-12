export function setOrDelete(immutable, updates) {
  return immutable.withMutations(mutable => {
    updates.forEach((value, key) => {
      if (value === undefined) {
        mutable.delete(key)
      }
      else {
        mutable.set(key, value)
      }
    })
  })
}
