/* @flow */

import {headers} from './headerSupport'

export default function getUserId(operation: {args: any[]}): ?string {
  let {args} = operation
  if (args[0] && args[0][headers]) {
    return args[0][headers].userId
  }
  try {
    return Meteor.userId()
  }
  catch (e) {
    throw new Error("unable to use Meteor.userId(); you must provide the userId manually using <collection>.withHeaders({userId}).<method>")
  }
}
