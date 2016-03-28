/* @flow */

import _ from 'lodash';
import moment from 'moment';
const Moment = moment.fn;

function pad(val: number, places: number): string {
  return _.padStart(val.toFixed(0), places, '0');
}

export function toTimeOfDay(date: number | Date | Moment): ?string {
  date = moment(date);
  if (isNaN(date.valueOf())) return undefined;
  
  if (date.millisecond()) {
    return `${pad(date.hour(), 2)}:${pad(date.minute(), 2)}:${pad(date.second(), 2)}.${pad(date.millisecond(), 3)}`;
  }
  if (date.second()) {
    return `${pad(date.hour(), 2)}:${pad(date.minute(), 2)}:${pad(date.second(), 2)}`;
  }
  return `${pad(date.hour(), 2)}:${pad(date.minute(), 2)}`;
}

export function toMilliseconds(strTimeOfDay: string | number): ?number {
  if (typeof strTimeOfDay === 'number') return strTimeOfDay;
  if (!strTimeOfDay || !strTimeOfDay.length) return undefined;
  let match = /(\d{1,2}):(\d{2})(:(\d{2})(.(\d{3}))?)?/.exec(strTimeOfDay);
  if (!match) return undefined;

  let hours = parseInt(match[1]);
  let minutes = parseInt(match[2]);
  let seconds = parseInt(match[4]) || undefined;
  let milliseconds = parseInt(match[6]) || undefined;

  return hours > 23 || minutes > 59 || (seconds && seconds > 59) ? undefined :
  hours * 3600000 + minutes * 60000 + (seconds || 0) * 1000 + (milliseconds || 0);
}

export function toMomentToday(timeOfDay: string | number, now?: number | Date | Moment): Moment {
  const ms = toMilliseconds(timeOfDay);
  if (isNaN(ms)) return moment(NaN);
  return (now !== undefined && now !== null ? 
    moment(now) : moment()).startOf('day').add(toMilliseconds(timeOfDay), 'ms');
}

export function toDateToday(timeOfDay: string | number, now?: number | Date | Moment): Date {
  return toMomentToday(timeOfDay, now).toDate();
}

export function toTimeToday(timeOfDay: string | number, now?: number | Date | Moment): number {
  return toMomentToday(timeOfDay, now).valueOf();
}
