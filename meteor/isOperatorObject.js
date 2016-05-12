// Copped from Meteor source, it's not part of exported api.
// Returns true if this is an object with at least one key and all keys begin
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
export default function isOperatorObject(valueSelector) {
  if (!LocalCollection._isPlainObject(valueSelector))
    return false

  var theseAreOperators = undefined
  _.each(valueSelector, function (value, selKey) {
    var thisIsOperator = selKey.substr(0, 1) === '$'
    if (theseAreOperators === undefined) {
      theseAreOperators = thisIsOperator
    } else if (theseAreOperators !== thisIsOperator) {
      throw new Error("Inconsistent operator: " +
        JSON.stringify(valueSelector))
    }
  })
  return !!theseAreOperators  // {} has no operators
}
