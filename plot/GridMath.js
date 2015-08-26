import {binarySearch, floorIndex, ceilingIndex, lowerIndex, higherIndex} from './precisebs';

var niceTimeIncrements = [
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

export function niceCeiling(value) {
  var floor = Math.pow(10, Math.floor(Math.log10(value)));
  if (floor >= value) {
    return floor;
  }
  if (floor * 2 >= value) {
    return floor * 2;
  }
  if (floor * 2.5 >= value) {
    return floor * 2.5;
  }
  if (floor * 4 >= value) {
    return floor * 4;
  }
  if (floor * 5 >= value) {
    return floor * 5;
  }
  return floor * 10;
}

export function isNiceIncrement(increment) {
  increment = Math.abs(increment);
  var normalized = increment / Math.pow(10, Math.floor(Math.log10(increment)));
  return normalized === 1 || normalized === 2 || normalized === 2.5 || normalized === 4 || normalized === 5;
}

export function chooseNiceIncrement(unitsPerPixel, minTickSpacingPixels) {
  if (unitsPerPixel < 0) return -chooseNiceIncrement(-unitsPerPixel, minTickSpacingPixels);
  return niceCeiling(minTickSpacingPixels * unitsPerPixel);
}

export function chooseNiceMajorIncrement(unitsPerPixel, minTickSpacingPixels, minorIncrement) {
  if (unitsPerPixel < 0) return -chooseNiceMajorIncrement(-unitsPerPixel, minTickSpacingPixels, -minorIncrement);
  for (var i = 1; i < 20; i++) {
    if (isNiceIncrement(minorIncrement * i) && minorIncrement * i >= minTickSpacingPixels * unitsPerPixel) {
      return minorIncrement * i;
    }
  }
}

/**
 * Chooses a "nice" time increment that will produce tick spacing of at least
 * <code>minTickSpacingPixels</code> at a scale of <code>pixelsPerMilli</code>.
 * Returns undefined if even an increment of one day would span less than <code>minTickSpacingPixels</code>.
 */ 
export function chooseNiceTimeIncrement(pixelsPerMilli, minTickSpacingPixels) {
    if (pixelsPerMilli < 0) return -chooseNiceTimeIncrement(-pixelsPerMilli, minTickSpacingPixels);
    var rough = minTickSpacingPixels / pixelsPerMilli;
    return niceTimeIncrements[ceilingIndex(niceTimeIncrements, rough)];
}

export function chooseNiceTimeMajorIncrement(pixelsPerMilli, minTickSpacingPixels, minorIncrement) {
    if (pixelsPerMilli < 0) return -chooseNiceTimeMajorIncrement(-pixelsPerMilli, minTickSpacingPixels, -minorIncrement);
    var i = ceilingIndex(niceTimeIncrements, minorIncrement);
    while (++i < niceTimeIncrements.length) {
      var increment = niceTimeIncrements[i];
      if (increment % minorIncrement === 0 && increment * pixelsPerMilli > minTickSpacingPixels) {
        return increment;
      }
    }
}

/**
 * Chooses a "nice" time increment that will produce tick spacing of at least
 * <code>minTickSpacingPixels</code> at a scale of <code>pixelsPerMilli</code>,
 * as well as divide evenly into <code>majorIncrement</code>.  In some cases this may just return
 * <code>majorIncrement</code>.
 * Returns undefined if even an increment of one day would span less than <code>minTickSpacingPixels</code>.
 */ 
export function chooseNiceTimeSubIncrement(pixelsPerMilli, minTickSpacingPixels, majorIncrement) {
    var rough = minTickSpacingPixels / pixelsPerMilli;
    var index = ceilingIndex(niceTimeIncrements, rough);
    while (niceTimeIncrements[index] < majorIncrement && (majorIncrement % niceTimeIncrements[index]) !== 0) {
        index++;
    }
    return niceTimeIncrements[index];
}

/**
 * Returns the greatest (closest to positive infinity) multiple of <code>mod</code> that is less than or equal to <code>value</code>.
 */
export function modFloor(value, mod, anchor) {
    if (anchor) return anchor + modFloor(value - anchor, mod);
    if (value < 0.0) return -modCeiling(-value, mod);  
    mod = Math.abs(mod);
    return value - value % mod;
}

export function modLower(value, mod, anchor) {
    var result = modFloor(value, mod, anchor);
    return result > value ? result : result - mod;
}

/**
 * Returns the least (closest to negative infinity) multiple of <code>mod</code> that is greater than or equal to <code>value</code>.
 */
export function modCeiling(value, mod, anchor) {
    if (anchor) return anchor + modCeiling(value - anchor, mod);
    if (value < 0.0) return -modFloor(-value, mod);
    mod = Math.abs(mod);
    var rem = value % mod;
    if (rem !== 0.0) value += mod - rem;
    return value;
}

export function modHigher(value, mod, anchor) {
    var result = modCeiling(value, mod, anchor);
    return result < value ? result : result + mod;
}