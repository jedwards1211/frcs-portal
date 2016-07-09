/* @flow */

const rx = /(^|\s+)(.)/g

/**
 * Generates prefixes of the given string up to all instances of the given separator, followed by the entire string.
 * @param{string} s the string to split
 * @param{string|RegExp} sep the separator
 */
export default function* initials(s: string): any {
  let match = rx.exec(s)
  while (match) {
    yield match[2]
    const nextMatch = rx.exec(s)
    if (nextMatch && nextMatch.index === match.index) break
    match = nextMatch
  }
}
