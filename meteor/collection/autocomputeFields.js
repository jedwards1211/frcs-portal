import _ from 'lodash';

import isOperatorObject from '../isOperatorObject';

/**
 * Decorates a Mongo.Collection class to autocompute the given fields when a document is
 * inserted, updated, or upserted.
 *
 * The type of fields is:
 *   {[field: string]: ComputeValue} | Array<((document: Object) => Object) | {[field: string]: ComputeValue}>
 * where
 *   ComputeValue: (document: Object) => any
 *
 * Each computeValue function in fields will be called in succession with the document.
 * If the function is an Object value, the field identified by the corresponding key will be set to the computed value.
 * If the function is an Array element, the fields in the computed value (which must be an object) will be set on the
 * document.
 */
export default function autocomputeFields(fields) {
  function applyFields(doc) {
    if (_.isArray(fields)) {
      fields.forEach(computeValue => {
        if (_.isFunction(computeValue)) {
          _.forEach(computeValue(doc), (value, field) => _.set(doc, field, value));
        }
        else {
          _.forEach(computeValue, (computeValue, field) => _.set(doc, field, computeValue(doc)));
        }
      });
    }
    else {
      _.forEach(fields, (computeValue, field) => _.set(doc, field, computeValue(doc)));
    }
    return doc;
  }
  
  function applyFieldsToModifier(modifier, doc) {
    let $set = {};
    if (_.isArray(fields)) {
      fields.forEach(computeValue => {
        if (_.isFunction(computeValue)) {
          _.forEach(computeValue(doc), (value, field) => {
            _.set(doc, field, value);
            $set[field] = value;
          });
        }
        else {
          Object.assign($set, _.mapValues(computeValue, (computeValue, field) => {
            let value = computeValue(doc);
            _.set(doc, field, value);
            return value;
          }));
        }
      });
    }

    return {
      ...modifier,
      $set: Object.assign({}, modifier.$set, $set)
    };
  }

  function maybeAsync(func, callback) {
    if (_.isFunction(callback)) {
      Meteor.setTimeout(() => {
        try {
          callback(undefined, func());
        }
        catch (err) {
          callback(err);
        }
      }, 0);
    }
    else {
      return func();
    }
  }
  
  return collection => Object.assign(Object.create(collection), {
    insert(document, ...args) {
      return collection.insert(applyFields(_.cloneDeep(document)), ...args);
    },
    update(selector, modifier, options, callback) {
      if (_.isFunction(options)) {
        callback = options;
        options = undefined;
      }
      options = options || {};

      if (options.upsert) {
        // caution: this.upsert() might call a surrounding decorator's method!
        return this.upsert.apply(this, arguments);
      }

      let findOptions;
      if (!options.multi) {
        findOptions = {limit: 1};
      }
      let singleUpdateOptions = {...options, limit: 1};

      return maybeAsync(
        () => {
          let numberAffected = 0;

          this.find(selector, findOptions).forEach(doc => {
            let {_id} = doc;
            doc = _.cloneDeep(doc);
            LocalCollection._modify(doc, modifier, options);

            numberAffected += collection.update(
              {...selector, _id},
              applyFieldsToModifier(modifier, doc),
              singleUpdateOptions
            );
          });

          return numberAffected;
        },
        callback
      );
    },
    upsert(selector, modifier, options, callback) {
      if (_.isFunction(options)) {
        callback = options;
        options = undefined;
      }
      options = options || {};

      let findOptions;
      if (!options.multi) {
        findOptions = {limit: 1};
      }
      let singleUpdateOptions = {...options, limit: 1};

      return maybeAsync(
        () => {
          let numberAffected = 0;
          let insertedId;

          this.find(selector, findOptions).forEach(doc => {
            let {_id} = doc;
            doc = _.cloneDeep(doc);
            LocalCollection._modify(doc, modifier, options);

            numberAffected += collection.update(
              {...selector, _id},
              applyFieldsToModifier(modifier, doc),
              singleUpdateOptions
            );
          });

          if (!numberAffected) {
            let doc = {};
            _.forEach(selector, (value, field) => isOperatorObject(value) || _.set(doc, field, value));
            LocalCollection._modify(doc, modifier, {...options, isInsert: true});

            insertedId = collection.upsert(selector, applyFieldsToModifier(modifier, doc), options).insertedId;
          }

          return {numberAffected, insertedId};
        },
        callback
      );
    }
  });
}
