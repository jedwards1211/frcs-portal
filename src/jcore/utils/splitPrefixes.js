/* @flow */

/**
 * Generates prefixes of the given string up to all instances of the given separator, followed by the entire string.
 * @param{string} s the string to split
 * @param{string|RegExp} sep the separator
 */
export default function* splitPrefixes(s: string, sep: string | RegExp): any {
  if (sep instanceof RegExp) {
    let match = sep.exec(s)
    while (match) {
      yield s.substring(0, match.index)
      const nextMatch = sep.exec(s)
      if (nextMatch && nextMatch.index === match.index) break
      match = nextMatch
    }
    if (s.length > 0) yield s
  }
  else {
    let index = s.indexOf(sep)
    if (index >= 0) {
      while (index < s.length) {
        yield s.substring(0, index)
        index = s.indexOf(sep, index + 1)
        if (index < 0) index = s.length
      }
    }
    if (s.length > 0) yield s
  }
}
