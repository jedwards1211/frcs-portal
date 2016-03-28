/* @flow */

import moment from 'moment';
const Moment = moment.fn;

import * as timeOfDayUtils from '../../timeOfDayUtils';

describe('timeOfDayUtils', () => {
  describe('toTimeOfDay', () => {
    function test(input: Moment, expected: string): void {
      expect(timeOfDayUtils.toTimeOfDay(input)).toBe(expected);
      expect(timeOfDayUtils.toTimeOfDay(input.toDate())).toBe(expected);
      expect(timeOfDayUtils.toTimeOfDay(input.valueOf())).toBe(expected);
    }
    
    it('works for time without seconds or milliseconds', () => {
      test(moment().startOf('day').hour(3).minute(45), '03:45');
    });
    it('works for time with seconds and no milliseconds', () => {
      test(moment().startOf('day').hour(17).minute(45).second(21), '17:45:21');
    });
    it('works for time with and no seconds milliseconds', () => {
      test(moment().startOf('day').hour(17).minute(45).millisecond(334), '17:45:00.334');
    });
    it('works for time with seconds and milliseconds', () => {
      test(moment().startOf('day').hour(17).minute(45).second(21).millisecond(334), '17:45:21.334');
    });
    it('returns undefined for invalid date', () => {
      test(moment(NaN), undefined);    
    });
  });
  
  describe('toMomentToday', () => {
    function test(input: ?string | ?number, expected: string): void {
      let date = timeOfDayUtils.toMomentToday(input);
      expect(date.format('HH:mm:ss.SSS')).toBe(expected);
      expect(date.startOf('day') === moment().startOf('day'));
    }
    
    it('works for numbers', () => {
      test(17 * 3600000 + 14 * 60000 + 7 * 1000 + 65, '17:14:07.065');
    });
    it('works for time without seconds or milliseconds', () => {
      test('17:25', '17:25:00.000');
    });
    it('works for time with 1-digit hour', () => {
      test('3:25', '03:25:00.000');
    });
    it('works for time with seconds', () => {
      test('03:25:13', '03:25:13.000');
    });
    it('works for time with seconds and milliseconds', () => {
      test('03:25:13.225', '03:25:13.225');
    });
    it('returns invalid date for invalid values', () => {
      test(undefined, 'Invalid date');
      test('24:00', 'Invalid date');
      test('22:60', 'Invalid date');
      test('22:00:60', 'Invalid date');
      test('22', 'Invalid date');
      test('2230', 'Invalid date');
      test('', 'Invalid date');
    });
  });
});
