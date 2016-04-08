/* @flow */

import _ from 'lodash';
import requireUserRoles from '../requireUserRoles';

const getUserId = {
  find: (selector, options) => (options && options.userId) || Meteor.userId(),
  findOne: (selector, options) => (options && options.userId) || Meteor.userId(),
  insert: (doc, callback, options) => (options && options.userId) || Meteor.userId(),
  update: (selector, modifier, options) => (options && options.userId) || Meteor.userId(),
  upsert: (selector, modifier, options) => (options && options.userId) || Meteor.userId(),
  remove: (selector, callback, options) => (options && options.userId) || Meteor.userId()
};

type PermitOptions = {
  never: () => void; 
  ifHasUserId: (userId: string) => void,
  ifHasRole: (role: string) => void
};

type Permit = (...methods: string[]) => PermitOptions;

/**
 * Decorates a Mongo.Collection instance to enforce permissions on find, findOne, insert, update,
 * upsert, and remove calls.  The API has mostly the same methods as ongoworks:security but you call it
 * differently, and rather than having to manually check the permissions, it checks all reads and writes
 * on the collection automatically.  If an operation is not permitted, this decorator will throw a Meteor.Error.
 * 
 * Checking permissions (unless an operation is always allowed) requires a userId.  The checks use Meteor.userId() 
 * by default, but you may override this by passing a userId prop in the `options` of the method (`insert` has
 * no `options` argument in the core `Mongo.Collection` API, but with this you may pass it as the 3rd argument,
 * after the callback.  Since Meteor.userId() throws in publish functions, you must pass in `this.userId` when
 * calling a method that isn't always allowed.
 * 
 * Example:
 * 
 * const Employees = enforcePermissions(permit => {
 *   permit('find', 'findOne'); // allows all authorized users to read
 *   permit('insert', 'update', 'upsert', 'remove').ifHasRole('admin'); // only allows admin users to write
 * })(new Mongo.Collection('employees'));
 */
export default function enforcePermissions(defineRules: (permit: Permit) => void): 
    (target: Mongo.Collection) => Mongo.Collection {
  const rules: {[method: string]: Array<Function>} = {};

  defineRules(function permit(...methods: string[]): PermitOptions {
    methods.forEach(method => {
      if (!getUserId[method]) throw new Error('invalid method: ' + method);
      rules[method] = [];
    });

    function createRules(creator) {
      methods.forEach(method => rules[method].push(creator(method)));
    }

    return {
      never:       () => createRules(method => () => {throw new Meteor.Error(403, 'Forbidden')}),
      ifHasUserId: (userId) => createRules(method => (...args) => {
        if (getUserId[method](...args) !== userId) {
          throw new Meteor.Error(403, 'Forbidden');
        }
      }),
      ifHasRole:   (role) => createRules(method => (...args) => requireUserRoles(getUserId[method](...args), role))
    };
  });

  return collection => Object.assign(Object.create(collection),
    _.mapValues(getUserId, (getUserId, method) => (...args) => {
      let ruleList = rules[method];
      if (!getUserId(...args)) {
        throw new Meteor.Error(401, 'Unauthorized');
      }
      if (!ruleList) {
        throw new Meteor.Error(403, 'Forbidden');
      }
      ruleList.forEach(checkRule => checkRule(...args));
      return (collection: Object)[method](...args);
    }),
    {insecure: collection}
  );
}