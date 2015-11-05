let CheckSchemaCollection;

// Copped from Meteor source, it's not part of exported api.
// Returns true if this is an object with at least one key and all keys begin
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
function isOperatorObject(valueSelector) {
  if (!LocalCollection._isPlainObject(valueSelector))
    return false;

  var theseAreOperators = undefined;
  _.each(valueSelector, function (value, selKey) {
    var thisIsOperator = selKey.substr(0, 1) === '$';
    if (theseAreOperators === undefined) {
      theseAreOperators = thisIsOperator;
    } else if (theseAreOperators !== thisIsOperator) {
      throw new Error("Inconsistent operator: " +
                      JSON.stringify(valueSelector));
    }
  });
  return !!theseAreOperators;  // {} has no operators
}

if (Meteor.isServer) {
  CheckSchemaCollection = class extends Mongo.Collection {
    constructor(name, options) {
      super(name, options);
      this._checkSchema = options.checkSchema;
    }
    _validate = (doc, modifier, options) => {
      doc = Object.assign({}, doc);
      if (modifier) {
        LocalCollection._modify(doc, modifier, options);
      }
      check(doc, this._checkSchema);      
    }
    insert(doc, callback) {
      this._validate(doc);
      return super.insert(doc, callback); 
    }
    update(selector, modifier, options, callback) {
      let findOptions;
      if (LocalCollection._isPlainObject(options)) {
        if (options.upsert) {
          this._beforeUpsert(...arguments);
          return super.update(...arguments);
        }
        if (!options.multi) {
          findOptions = {limit: 1};
        }
      }
      this.find(selector, findOptions).forEach(doc => this._validate(doc, modifier));
      return super.update(...arguments);
    }
    _beforeUpsert(selector, modifier, options, callback) {
      let findOptions;
      if (LocalCollection._isPlainObject(options)) {
        if (!options.multi) {
          findOptions = {limit: 1};
        }
      }
      let cursor = this.find(selector, findOptions);
      if (!cursor.count()) {
        // LocalCollection.update currently doesn't remove operators properly!
        // Filed as issue #5611
        let doc = {};
        for (var key in selector) {
          if (selector.hasOwnProperty(key) && !isOperatorObject(selector[key])) {
            doc[key] = selector[key];
          }
        }
        LocalCollection._modify(doc, modifier, {isInsert: true});
        check(doc, this._checkSchema);
      }
      else {
        cursor.forEach(doc => this._validate(doc, modifier));
      }
    }
    upsert(selector, modifier, options, callback) {
      this._beforeUpsert(...arguments);
      return super.upsert(...arguments);
    }
  };
}
else {
  CheckSchemaCollection = Mongo.Collection;
}

export default CheckSchemaCollection;
