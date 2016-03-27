/* @flow */
/* eslint-disable no-console */

import _ from 'lodash';

const formatTime = (time) => `@ ${_.padStart(time.getHours(), 2, '0')}:${_.padStart(time.getMinutes(), 2, '0')}:${_.padStart(time.getSeconds(), 2, '0')}.${_.padStart(time.getMilliseconds(), 3, '0')}`;

export default function logMeteorCall(methodName: string, ...args: any[]): void {
  const title = `Meteor.call ${formatTime(new Date())} ${methodName}`;
  try {
    console.group(title);
  }
  catch (e) {
    console.log(title);
  }
  
  args.slice(0, args.length - 1).forEach((arg, index) => console.log(`[${_.padStart(index, 2, '0')}]`, arg));
  
  try {
    console.groupEnd();
  } catch (e) {
    console.log(`—— log end ——`);
  }
}

export function install() {
  let wrappedCall = Meteor.call;
  Meteor.call = (methodName, ...args) => {
    logMeteorCall(methodName, ...args);
    wrappedCall(methodName, ...args);
  };
}
