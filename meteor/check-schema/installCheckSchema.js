/* eslint-disable no-inner-declarations */
/* eslint-disable no-console */

import _ from 'lodash';
import isOperatorObject from '../isOperatorObject';

const MCp = Mongo.Collection.prototype;

if (Meteor.isServer) {
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
        if (callback) {
          callback(err);
          return;
        }
        throw err;
      }
    }
    return oldInsert.apply(this, arguments);
  };

  MCp._beforeUpsert = function(selector, modifier, options) {
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
      _.forEach(selector, (value, field) => isOperatorObject(value) || _.set(doc, field, value));
      LocalCollection._modify(doc, modifier, {...options, isInsert: true});
      
      try {
        check(doc, this._checkSchema);
      }
      catch (err) {
        if ("production" !== process.env.NODE_ENV) {
          console.error('upsert validation failed:');
          console.error('  collection: ' + this._name);
          console.error('  selector: ' + stringify(selector, '  '));
          console.error('  modifier: ' + stringify(modifier, '  '));
          console.error('  options:  ' + stringify(options, '  '));
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
            console.error('  options:  ' + stringify(options, '  '));
            console.error('  document: ' + stringify(doc, '  '));
          }
          throw err;          
        }
      });
    }
  };

  const oldUpdate = MCp.update;
  MCp.update = function(selector, modifier, options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = undefined;
    }

    if (this._checkSchema) {
      let findOptions;
      if (LocalCollection._isPlainObject(options)) {
        if (options.upsert) {
          try {
            this._beforeUpsert(...arguments);
          }
          catch (err) {
            if (callback) {
              callback(err);
              return;
            }
            throw err;
          }
          return oldUpdate.apply(this, arguments);
        }
        if (!options.multi) {
          findOptions = {limit: 1};
        }
      }
      try {
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
              console.error('  options:  ' + stringify(options, '  '));
              console.error('  document: ' + stringify(doc, '  '));
            }
            throw err;
          }
        });
      }
      catch (err) {
        if (callback) {
          callback(err);
          return;
        }
        throw err;
      }
    }
    return oldUpdate.call(this, ...arguments);
  };

  const oldUpsert = MCp.upsert;
  MCp.upsert = function(selector, modifier, options, callback) {

    if (this._checkSchema) {
      if (_.isFunction(options)) {
        callback = options;
        options = undefined;
      }
      try {
        this._beforeUpsert(...arguments);
      }
      catch (err) {
        if (callback) {
          callback(err);
          return;
        }
        throw err;
      }
    }
    return oldUpsert.apply(this, arguments);
  }
}
else {
  MCp.attachSchema = function() {};
}
