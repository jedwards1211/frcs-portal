/* @flow */

import _ from 'lodash';
import {hasUserRoles} from '../requireUserRoles';

import type {Selector} from '../../flowtypes/meteorTypes';
import type {Modifier} from '../../flowtypes/mongoTypes';

type Method = 'find' | 'findOne' | 'insert' | 'update' | 'upsert' | 'remove';
type MethodOrGroup = Method | 'read' | 'write';

/**
 * Determines if a rule applies for the given collection, method being attempted, and arguments to the method.
 */
type Condition = (args: {selector?: Selector, options: Object, document?: Object, modifier?: Modifier,
                         collection: Mongo.Collection, method: Method}) => boolean;

/**
 * Decorates a Mongo.Collection instance to enforce permissions on find, findOne, insert, update,
 * upsert, and remove calls.  If an operation is denied, this decorator will throw a Meteor.Error.constructor
 * 
 * By default, all operations are allowed.  If you pass deny() as the last argument, it will deny all operations that
 * were not explicitly allowed.
 * 
 * Checking permissions (unless an operation is always allowed) requires a userId.  The checks use Meteor.userId() 
 * by default, but you may override this by passing a userId prop in the `options` of the method (`insert` has
 * no `options` argument in the core `Mongo.Collection` API, but with this you may pass it as the 3rd argument,
 * after the callback.  Since Meteor.userId() throws in publish functions, you must pass in `this.userId` when
 * calling a method that isn't always allowed.
 *
 * @param{Rule[]} ...rules - a list of rules to enforce.  Rules may be created using allow() and deny(), which are
 * exported from this module.
 *
 * enforcePermissions will check the rules in the order returned from createRules and stop on the first rule that
 * applies.  That means if an allow() rule applies, the operation will immediately proceed without checking any of
 * the subsequent rules, and if a deny() rule applies, the operation will immediately fail without checking any of
 * the subsequent rules.
 *
 * Example:
 *
 * import enforcePermissions, {allow, deny, userIsLoggedIn, userHasRole} from './enforcePermissions';
 * 
 * const Employees = enforcePermissions(
 *   allow('find', 'findOne').where(userIsLoggedIn),                            // allows all authorized users to read
 *   allow('insert', 'update', 'upsert', 'remove').where(userHasRole('admin')), // allows admin users to write
 *   deny()                                                                     // denies all other operations
 * )(new Mongo.Collection('employees'));
 */
export default function enforcePermissions(...rules: Rule[]): (collection: Mongo.Collection) => Mongo.Collection {
  let methodsWithRules = rules.reduce((methods, rule) => Object.assign(methods, rule.methods), {});
  
  return collection => Object.assign(Object.create(collection),
    _.mapValues(methodsWithRules, (v, method) => {
      let ruleChain = rules.reduceRight((next, rule) => rule.chain(method, next), () => true);
      
      return (...args) => {
        ruleChain({
          ...normalizeArgs[method](...args),
          collection,
          method
        });
        return (collection: Object)[method](...args);
      };
    }),
    {insecure: collection}
  );
}

class Rule {
  methods: {[method: Method]: true};
  condition: Condition = always;

  constructor(...methods: MethodOrGroup[]) {
    if (methods.length) {
      this.methods = {};
      _.uniq(_.flatMap(methods, method => methodGroups[method] || method))
        .forEach(method => this.methods[method] = true);
    }
    else {
      this.methods = _.mapValues(normalizeArgs, () => true);
    }
  }

  chain(method: Method, next: Condition): Condition {
    return next;
  }

  /**
   * Sets the condition under which this rule applies.
   */
  where(condition: Condition) {
    this.condition = condition;
    return this;
  }
}

class AllowRule extends Rule {
  chain(method: Method, next: Condition): Condition {
    if (this.methods[method]) {
      return args => this.condition(args) || next(args);
    }
    return next;
  }
}

class DenyRule extends Rule {
  chain(method: Method, next: Condition): Condition {
    if (this.methods[method]) {
      return args => {
        if (this.condition(args)) {
          if (getUserId(args.options)) {
            throw new Meteor.Error(403, 'Forbidden');
          }
          else {
            throw new Meteor.Error(401, 'Unauthorized');
          }
        }
        return next(args);
      };
    }
    return next;
  }
}

/**
 * Creates a Rule that allows the given operations in all cases.  
 * You may change the condition under which it applies by calling .where(condition) on the returned Rule.
 * 
 * @param{string[]} ...methods - the methods (aka operations) to allow.  May be any of the following:
 * - 'find'
 * - 'findOne'
 * - 'read' (equivalent to 'find', 'findOne')
 * - 'insert'
 * - 'update'
 * - 'upsert'
 * - 'remove'
 * - 'write' (equivalent to 'insert', 'update', 'upsert', 'remove')
 * Passing no arguments means the Rule applies to all operations.
 */
export const allow: (...methods: MethodOrGroup[]) => AllowRule = (...methods) => new AllowRule(...methods);

/**
 * Creates a Rule that denies the given operations in all cases.  
 * You may change the condition under which it applies by calling .where(condition) on the returned Rule.
 * 
 * @param{string[]} ...methods - the methods (aka operations) to allow.  May be any of the following:
 * - 'find'
 * - 'findOne'
 * - 'read' (equivalent to 'find', 'findOne')
 * - 'insert'
 * - 'update'
 * - 'upsert'
 * - 'remove'
 * - 'write' (equivalent to 'insert', 'update', 'upsert', 'remove')
 * Passing no arguments means the Rule applies to all operations.
 */
export const deny:  (...methods: MethodOrGroup[]) => DenyRule  = (...methods) => new DenyRule (...methods);

/**
 * A condition that always applies.
 */
export const always: Condition = () => true;
/**
 * A condition that never applies.
 */
export const never:  Condition = () => false;
/**
 * A condition that applies when the user is logged in.
 */
export const userIsLoggedIn: Condition = ({options}) => getUserId(options) != null;
/**
 * @returns condition that applies when the user's id is one of the given userIds.
 */
export function userIn(...userIds: string[]): Condition {
  const idMap = {};
  userIds.forEach(userId => idMap[userId] = true);
  return ({options}) => {
    const userId = getUserId(options);
    return !!(userId && idMap[userId]);
  };
}
/**
 * @returns a condition that only applies when the user has the given role.
 */
export function userHasRole(role: string): Condition {
  return userHasAnyRole(role);
}
/**
 * @returns a condition that applies when the user has any of the given roles.
 */
export function userHasAnyRole(...roles: string[]): Condition {
  return ({options}) => {
    const userId = getUserId(options);
    return !!userId && _.some(roles, role => hasUserRoles(userId, role));
  };
}
/**
 * @returns a condition that applies when the user has all of the given roles.
 */
export function userHasAllRoles(...roles: string[]): Condition {
  return ({options}) => {
    const userId = getUserId(options);
    return !!userId && hasUserRoles(userId, roles);
  };
}

function getUserId(options: Object): ?string {
  return options.userId || Meteor.userId();
}

const normalizeArgs = {
  find:     (selector, options = {})           => ({selector, options}),
  findOne:  (selector, options = {})           => ({selector, options}),
  insert:   (document, callback, options = {}) => ({document, options}),
  update:   (selector, modifier, options = {}) => ({selector, modifier, options}),
  upsert:   (selector, modifier, options = {}) => ({selector, modifier, options}),
  remove:   (selector, callback, options = {}) => ({selector, options})
};

const methodGroups = {
  read: ['find', 'findOne'],
  write: ['insert', 'update', 'upsert', 'remove']
};
