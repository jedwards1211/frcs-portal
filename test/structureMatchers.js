import unequalPaths from '../utils/unequalPaths'

export default {
  toEqualStructure(util, customEqualityTesters) {
    return {
      compare(actual, expected) {
        let result = {}
        result.pass = util.equals(actual, expected, customEqualityTesters)
        if (!result.pass) {
          let paths = unequalPaths(actual, expected)
          let lines = ['Expected arguments to be equal.  Unequal paths:']
          paths.forEach(({path, a: actual, b: expected}) => {
            lines.push('  ' + (path.length ? path.join('.') : '(root)') + ':')
            lines.push(...('actual:   ' + JSON.stringify(actual, null, 2)).split(/\n/).map(line => '    ' + line))
            lines.push(...('expected: ' + JSON.stringify(expected, null, 2)).split(/\n/).map(line => '    ' + line))
          })
          result.message = lines.join('\n')
        }
        else {
          result.message = 'Expected arguments to be unequal.'
        }
        return result
      }
    }
  }
}
