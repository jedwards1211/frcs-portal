import {binarySearch, floorIndex, ceilingIndex, lowerIndex, higherIndex} from './precisebs';

/**
 * @return a value >= x and < x * 10 that divides evenly into a power of 10.
 */ 
export function niceCeiling(x) {
  var floor = Math.pow(10, Math.floor(Math.log10(x)));
  if (floor >= x) {
    return floor;
  }
  if (floor * 2 >= x) {
    return floor * 2;
  }
  if (floor * 2.5 >= x) {
    return floor * 2.5;
  }
  if (floor * 4 >= x) {
    return floor * 4;
  }
  if (floor * 5 >= x) {
    return floor * 5;
  }
  return floor * 10;
}

/**
 * @return true iff increment divides some power of 10 evenly.
 */
export function isNiceIncrement(increment) {
  increment = Math.abs(increment);
  var normalized = increment / Math.pow(10, Math.floor(Math.log10(increment)));
  return normalized === 1 || normalized === 2 || normalized === 2.5 || normalized === 4 || normalized === 5;
}

/**
 * @returns an increment that:
 * - divides some power of 10 evenly
 * - satisfies: increment * unitsPerPixel > minTickSpacingPixels
 * - is a multiple of subIncrement (if it is given)
 */
export function chooseNiceIncrement(unitsPerPixel, minTickSpacingPixels, subIncrement) {
  if (unitsPerPixel < 0) return -chooseNiceIncrement(-unitsPerPixel, minTickSpacingPixels, -subIncrement);
  if (subIncrement !== undefined) {
    for (var i = 1; i < 20; i++) {
      if (isNiceIncrement(subIncrement * i) && subIncrement * i >= minTickSpacingPixels * unitsPerPixel) {
        return subIncrement * i;
      }
    }    
  }
  return niceCeiling(minTickSpacingPixels * unitsPerPixel);
}

const niceTimeIncrements = [
         1,
         2,
         5,
         10,
         20,
         25,
         50,
         100,
         200,
         250,
         500,
         1000,
    2  * 1000,
    5  * 1000,
    10 * 1000,
    15 * 1000,
    20 * 1000,
    30 * 1000,
         60000,
    2  * 60000,
    5  * 60000,
    10 * 60000,
    15 * 60000,
    20 * 60000,
    30 * 60000,
         3600000,
    2  * 3600000,
    3  * 3600000,
    4  * 3600000,
    6  * 3600000,
    12 * 3600000,
         86400000
];

/**
 * @returns an increment (in milliseconds) that:
 * - divides one day, one hour, one minute, one second, or one millisecond evenly
 * - satisfies: increment * unitsPerPixel > minTickSpacingPixels
 * - is a multiple of subIncrement (if it is given)
 * If minTickSpacingPixels * unitsPerPixel > one day (in milliseconds), returns undefined.
 */ 
export function chooseNiceTimeIncrement(unitsPerPixel, minTickSpacingPixels, subIncrement) {
    if (unitsPerPixel < 0) return -chooseNiceTimeMajorIncrement(-unitsPerPixel, minTickSpacingPixels, -subIncrement);
    if (subIncrement !== undefined) {
      var i = ceilingIndex(niceTimeIncrements, subIncrement);
      while (++i < niceTimeIncrements.length) {
        var increment = niceTimeIncrements[i];
        if (increment % subIncrement === 0 && increment > minTickSpacingPixels * unitsPerPixel) {
          return increment;
        }
      }
    }
    var rough = minTickSpacingPixels * unitsPerPixel;
    return niceTimeIncrements[ceilingIndex(niceTimeIncrements, rough)];
}

/**
 * Returns the greatest (closest to positive infinity) multiple of mod that is <= value.
 */
export function modFloor(value, mod, anchor) {
    if (anchor) return anchor + modFloor(value - anchor, mod);
    if (value < 0.0) return -modCeiling(-value, mod);  
    mod = Math.abs(mod);
    return value - value % mod;
}

/**
 * Returns the greatest (closest to positive infinity) multiple of mod that is < value.
 */
export function modLower(value, mod, anchor) {
    var result = modFloor(value, mod, anchor);
    return result > value ? result : result - mod;
}

/**
 * Returns the least (closest to negative infinity) multiple of mod that is >= value.
 */
export function modCeiling(value, mod, anchor) {
    if (anchor) return anchor + modCeiling(value - anchor, mod);
    if (value < 0.0) return -modFloor(-value, mod);
    mod = Math.abs(mod);
    var rem = value % mod;
    if (rem !== 0.0) value += mod - rem;
    return value;
}

/**
 * Returns the least (closest to negative infinity) multiple of mod that is > value.
 */
export function modHigher(value, mod, anchor) {
    var result = modCeiling(value, mod, anchor);
    return result < value ? result : result + mod;
}
