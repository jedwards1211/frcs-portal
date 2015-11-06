/* eslint-disable no-inner-declarations */
/* eslint-disable no-console */

const MCp = Mongo.Collection.prototype;

if (Meteor.isServer) {
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

  MCp.attachSchema = function(checkSchema) {
    this._checkSchema = checkSchema;
  }

  function stringify(value, indent) {
    return JSON.stringify(value, null, 2).replace(/\n/g, '\n' + indent);
  }

  const oldInsert = MCp.insert;
  MCp.insert = function(doc, callback) {
    if (this._checkSchema) {
      try {
        check(doc, this._checkSchema);
      }
      catch (err) {
        if ("production" !== process.env.NODE_ENV) {
          console.error('insert validation failed:');
          console.error('  collection: ' + this._name);
          console.error('  document: ' + stringify(doc, '  '));
        }
        throw err;
      }
    }
    return oldInsert.apply(this, arguments);
  };

  MCp._beforeUpsert = function(selector, modifier, options, callback) {
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
      try {
        check(doc, this._checkSchema);
      }
      catch (err) {
        if ("production" !== process.env.NODE_ENV) {
          console.error('upsert validation failed:');
          console.error('  collection: ' + this._name);
          console.error('  selector: ' + stringify(selector, '  '));
          console.error('  modifier: ' + stringify(modifier, '  '));
          console.error('  document: ' + stringify(doc, '  '));
        }
        throw err;
      }
    }
    else {
      cursor.forEach(doc => {
        doc = Object.assign({}, doc);
        if (modifier) {
          LocalCollection._modify(doc, modifier, options);
        }
        try {
          check(doc, this._checkSchema);
        }
        catch (err) {
          if ("production" !== process.env.NODE_ENV) {
            console.error('upsert validation failed:');
            console.error('  collection: ' + this._name);
            console.error('  selector: ' + stringify(selector, '  '));
            console.error('  modifier: ' + stringify(modifier, '  '));
            console.error('  document: ' + stringify(doc, '  '));
          }
          throw err;          
        }
      });
    }
  };

  const oldUpdate = MCp.update;
  MCp.update = function(selector, modifier, options, callback) {
    if (this._checkSchema) {
      let findOptions;
      if (LocalCollection._isPlainObject(options)) {
        if (options.upsert) {
          this._beforeUpsert(...arguments);
          return oldUpdate.apply(this, arguments);
        }
        if (!options.multi) {
          findOptions = {limit: 1};
        }
      }
      this.find(selector, findOptions).forEach(doc => {
        doc = Object.assign({}, doc);
        if (modifier) {
          LocalCollection._modify(doc, modifier, options);
        }
        try {
          check(doc, this._checkSchema);
        }
        catch (err) {
          if ("production" !== process.env.NODE_ENV) {
            console.error('update validation failed:');
            console.error('  collection: ' + this._name);
            console.error('  selector: ' + stringify(selector, '  '));
            console.error('  modifier: ' + stringify(modifier, '  '));
            console.error('  document: ' + stringify(doc, '  '));
          }
          throw err;          
        }
      });
    }
    return oldUpdate.call(this, ...arguments);
  };

  const oldUpsert = MCp.upsert;
  MCp.upsert = function(selector, modifier, options, callback) {
    if (this._checkSchema) {
      this._beforeUpsert(...arguments);
    }
    return oldUpsert.apply(this, arguments);
  }
}
else {
  MCp.attachSchema = function() {};
}
