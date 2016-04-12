/* @flow */

import _ from 'lodash';

import type {Selector} from '../../flowtypes/meteorTypes';
import type {Modifier} from '../../flowtypes/mongoTypes';

export type Method = 'find' | 'findOne' | 'insert' | 'update' | 'upsert' | 'remove';
export type MethodOrGroup = Method | 'read' | 'write';

/**
 * Determines if a rule applies for the given collection, method being attempted, and arguments to the method.
 */
export type Condition = (args: {selector?: Selector, options: Object, document?: Object, modifier?: Modifier,
                         collection: Mongo.Collection, method: Method}) => boolean;

/**
 * Wraps a Mongo.Collection instance to enforce permissions on find, findOne, insert, update,
 * upsert, and remove calls.  If an operation is denied, the wrapper will throw a Meteor.Error.
 * 
 * By default, all operations are allowed.  If you pass deny() as the last argument, it will deny all operations that
 * were not explicitly allowed.
 * 
 * Checking permissions (unless an operation is always allowed) requires a userId.  The checks use Meteor.userId() 
 * by default, but you may override this by passing a userId prop in the `options` of the method (you can pass any
 * userId, regardless of whether they are logged in; you don't have to pass Meteor.userId()).
 * In the public Mongo.Collection API, the insert() and remove() methods don't take an options argument, but this
 * wrapper accepts it as the 3rd argument so that you can pass the userId.
 * Since Meteor.userId() throws in publish functions, you must pass in `this.userId` in the options when
 * calling a method that isn't always allowed.
 * 
 * The wrapper will also have these additonal properties:
 * - insecure: the wrapped collection.  Methods called on it will not go through accessRules checks.
 * - checkPermissions(method, ...args): throws a Meteor.Error if the given operation would fail
 *
 * @param{Rule[]} ...rules - a list of rules to enforce.  Rules may be created using allow() and deny(), which are
 * exported from this module.
 *
 * accessRules will check the rules in the order returned from createRules and stop on the first rule that
 * applies.  That means if an allow() rule applies, the operation will immediately proceed without checking any of
 * the subsequent rules, and if a deny() rule applies, the operation will immediately fail without checking any of
 * the subsequent rules.
 *
 * Example:
 *
 * import accessRules, {allow, deny} from './accessRules';
 * import {userIsLoggedIn, userHasRole} from './myConditions';
 * 
 * const Employees = accessRules(
 *   allow('find', 'findOne').where(userIsLoggedIn),                            // allows all authorized users to read
 *   allow('insert', 'update', 'upsert', 'remove').where(userHasRole('admin')), // allows admin users to write
 *   deny()                                                                     // denies all other operations
 * )(new Mongo.Collection('employees'));
 */
export default function accessRules(...rules: Rule[]): (collection: Mongo.Collection) => Mongo.Collection {
  const methodsWithRules = rules.reduce((methods, rule) => Object.assign(methods, rule.methods), {});
  
  const ruleChains = _.mapValues(methodsWithRules, (v, method) => 
    rules.reduceRight((next, rule) => rule.chain(method, next), () => true));
  
  return collection => Object.assign(Object.create(collection),
    _.mapValues(ruleChains, (ruleChain, method) => (...args) => {
      ruleChain({
        ...normalizeArgs[method](...args),
        collection,
        method
      });
      return (collection: Object)[method](...args);
    }),
    {
      insecure: collection,
      checkPermissions: (method: Method, ...args) => {
        let ruleChain = ruleChains[method];
        ruleChain && ruleChain({
          ...normalizeArgs[method](...args),
          collection,
          method
        });
      }
    }
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
          if (getUserId(args)) {
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

export function getUserId(args: {selector?: Selector, options: Object, document?: Object, modifier?: Modifier,
  collection: Mongo.Collection, method: Method}): ?string {
  for (let obj: mixed of [args.options, args.selector, args.document]) {
    if (obj instanceof Object && 'userId' in obj) {
      return obj.userId;
    }
  }
  return Meteor.userId();
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
