import _ from 'lodash';

import type {Selector} from '../../flowtypes/meteorTypes';

export default function getUserId(args: {selector?: Selector, options?: Object, document?: Object}): ?string {
  for (let obj: mixed of [args.selector, args.document]) {
    let userId = _.get(obj, ['$ext', 'userId']);
    if (userId) return userId;
  }
  if (args.options && args.options.userId) return args.options.userId;
  return Meteor.userId();
}
