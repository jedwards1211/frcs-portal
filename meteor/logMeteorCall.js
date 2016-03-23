/* @flow */
/* eslint-disable no-console */

const repeat = (str, times) => (new Array(times + 1)).join(str);
const pad = (num, maxLength) => repeat(`0`, maxLength - num.toString().length) + num;
const formatTime = (time) => `@ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;

export default function logMeteorCall(methodName: string, ...args: any[]): void {
  const title = `meteor call ${formatTime(new Date())} ${methodName}`;
  try {
    console.group(title);
  }
  catch (e) {
    console.log(title);
  }
  
  args.slice(0, args.length - 1).forEach((arg, index) => console.log(`[${pad(index, 2)}]: `, arg));
  
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
