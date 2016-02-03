/**
 * Created by andy on 1/12/16.
 */

import LinearConversion from '../../LinearConversion';
import approxMatchers from '../../../test/approxMatchers';

describe('LinearConversion', () => {
  beforeEach(function() {
    jasmine.addMatchers(approxMatchers);
  });

  describe('set', () => {
    describe('x1, y1, x2, y2 case', () => {
      it('works for valid values', () => {
        let c = new LinearConversion(-5, 50, 15, 100);
        expect(c.convert(-5)).toBe(50);
        expect(c.convert(5)).toBe(75);
        expect(c.convert(15)).toBe(100);

        c = new LinearConversion(15, 50, -5, 100);
        expect(c.convert(15)).toBe(50);
        expect(c.convert(5)).toBe(75);
        expect(c.convert(-5)).toBe(100);
      });
      it('throws for singular conversion', () => {
        expect(() => new LinearConversion(0, 50, 0, 50)).toThrow();
      });
      it('throws for NaN values', () => {
        expect(() => new LinearConversion(NaN, 50, 10, 100)).toThrow();
        expect(() => new LinearConversion(0, NaN, 10, 100)).toThrow();
        expect(() => new LinearConversion(0, 50, NaN, 100)).toThrow();
        expect(() => new LinearConversion(0, 50, 10, NaN)).toThrow();
      });
      it('throws for infinite values', () => {
        expect(() => new LinearConversion(Infinity, 50, 10, 100)).toThrow();
        expect(() => new LinearConversion(0, Infinity, 10, 100)).toThrow();
        expect(() => new LinearConversion(0, 50, Infinity, 100)).toThrow();
        expect(() => new LinearConversion(0, 50, 10, Infinity)).toThrow();
      });
    });
    describe('convert/invert', () => {
      it('they are inverse of each other', () => {
        let c = new LinearConversion(0, 50, 10, 100);
        expect(c.invert(c.convert(3))).toBeApprox(3);
        expect(c.convert(c.invert(3))).toBeApprox(3);
        expect(c.invert(c.convert(7))).toBeApprox(7);
        expect(c.convert(c.invert(7))).toBeApprox(7);
      });
    });
    describe('zoom', () => {
      it('keeps center the same', () => {
        for (let i = 0; i < 100; i++) {
          let c = new LinearConversion(15, 50, -5, 100);
          let center = Math.random();
          let expected = c.convert(center);
          c.zoom(center, Math.random() + 0.1);
          let actual = c.convert(center);
          expect(actual).toBeApprox(expected);
        }
      });
    });
    describe('clampDomain', () => {
      it('works for exact values', () => {
        let c = new LinearConversion(-5, 50, 10, 110);
        c.clampDomain(50, 110, 70, undefined, 12);
        expect(c.convert(0)).toBe(70);
        expect(c.convert(-4)).toBe(50);
        expect(c.convert(8)).toBe(110);

        c = new LinearConversion(-5, 50, 10, 110);
        c.clampDomain(50, 110, 70, 24, undefined);
        expect(c.convert(0)).toBe(70);
        expect(c.convert(-8)).toBe(50);
        expect(c.convert(16)).toBe(110);
      });
      it('works for exact values with negative scale', () => {
        let c = new LinearConversion(-5, 110, 10, 50);
        c.clampDomain(50, 110, 70, undefined, 12);
        expect(c.convert(5)).toBe(70);
        expect(c.convert(-3)).toBe(110);
        expect(c.convert(9)).toBe(50);

        c = new LinearConversion(-5, 110, 10, 50);
        c.clampDomain(50, 110, 70, 24, undefined);
        expect(c.convert(5)).toBe(70);
        expect(c.convert(-11)).toBe(110);
        expect(c.convert(13)).toBe(50);
      });
      it('throws for d1 == d2', () => {
        let c = new LinearConversion(-5, 50, 10, 110);
        expect(() => c.clampDomain(50, 50, 70, undefined, 12)).toThrow();
      });
      it('throws for invalid values', () => {
        let c = new LinearConversion(-5, 50, 10, 110);
        expect(() => c.clampDomain(undefined, 10, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(NaN, 10, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(Infinity, 10, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, undefined, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, NaN, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, Infinity, 0, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, 10, undefined, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, 10, NaN, undefined, 48)).toThrow();
        expect(() => c.clampDomain(-5, 10, Infinity, undefined, 48)).toThrow();
      });
    });
  });
});
