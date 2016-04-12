/* @flow */

import _ from 'lodash';

import type {Selector} from '../../flowtypes/meteorTypes';

export default function getUserId(operation: {selector?: Selector, options?: Object, document?: Object}): ?string {
  for (let obj: mixed of [operation.selector, operation.document]) {
    let userId = _.get(obj, ['$ext', 'userId']);
    if (userId) return userId;
  }
  if (operation.options && operation.options.userId) return operation.options.userId;
  return Meteor.userId();
}
