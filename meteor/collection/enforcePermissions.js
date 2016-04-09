/* @flow */

import _ from 'lodash';
import {hasUserRoles} from '../requireUserRoles';

function getUserId(options: Object = {}): ?string { return options.userId || Meteor.userId(); }
Object.assign(getUserId, {
  find:     (selector, options)           => getUserId(options),
  findOne:  (selector, options)           => getUserId(options),
  insert:   (doc, callback, options)      => getUserId(options),
  update:   (selector, modifier, options) => getUserId(options),
  upsert:   (selector, modifier, options) => getUserId(options),
  remove:   (selector, callback, options) => getUserId(options)
});

const methodGroups = {
  read: ['find', 'findOne'],
  write: ['insert', 'update', 'upsert', 'remove']
};

type Condition = (method: string, userId: string, ...args: any[]) => boolean;

class Rule {
  condition: Condition = () => true;
  check(method: string, userId: string, ...args: any[]): ?boolean {}
  ifLoggedIn() { this.condition = (method, userId) => userId != null; }
  ifHasUserId(...userIds: string[]) {
    let idMap = {};
    userIds.forEach(userId => idMap[userId] = true);
    this.condition = (method, userId) => idMap[userId];
  }
  ifHasRoles(...roles: string[]) { this.condition = (method, userId) => hasUserRoles(userId, roles); }
  where(condition: Condition) { this.condition = condition; }
}

class AllowRule extends Rule {
  check(method: string, userId: string, ...args: any[]): ?boolean {
    return this.condition(method, userId, ...args) || undefined;
  }
}

class DenyRule extends Rule {
  check(method: string, userId: string, ...args: any[]): ?boolean {
    if (this.condition(method, userId, ...args)) {
      if (userId) {
        throw new Meteor.Error(403, 'Forbidden');
      }
      else {
        throw new Meteor.Error(401, 'Unauthorized');
      }
    }
  }
}

/**
 * Decorates a Mongo.Collection instance to enforce permissions on find, findOne, insert, update,
 * upsert, and remove calls.  The API has similar methods to ongoworks:security but you call it
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
 *   permit('insert', 'update', 'upsert', 'remove').ifHasRoles('admin'); // only allows admin users to write
 * })(new Mongo.Collection('employees'));
 */
export default function enforcePermissions(defineRules: (allow: (...methods: string[]) => AllowRule,
                                                         deny: (...methods: string[]) => DenyRule) => any):
    (target: Mongo.Collection) => Mongo.Collection {
  const rules: {[method: string]: Rule[]} = _.mapValues(getUserId, () => [new DenyRule()]);

  function allow(...methods: string[]): AllowRule {
    methods = _.uniq(_.flatMap(methods, method => methodGroups[method] || method));
    let rule = new AllowRule();
    methods.forEach(method => rules[method].push(rule));
    return rule;
  }

  function deny(...methods: string[]): DenyRule {
    methods = _.uniq(_.flatMap(methods, method => methodGroups[method] || method));
    let rule = new DenyRule();
    methods.forEach(method => rules[method].push(rule));
    return rule;
  }

  defineRules(allow, deny);
  
  return collection => Object.assign(Object.create(collection),
    _.mapValues(getUserId, (getUserId, method) => (...args) => {
      let userId = getUserId(...args);

      let ruleList = rules[method];
      for (let i = ruleList.length - 1; i >= 0; i--) {
        let verdict = ruleList[i].check(method, userId, ...args);
        if (verdict === true) break;
        if (verdict === false) return;
      }

      return (collection: Object)[method](...args);
    }),
    {insecure: collection}
  );
}
