import Colr from 'colr';
import cssColor from 'css-color-converter';
import _ from 'lodash';

function random(range) {
  return range[0] + Math.random() * (range[1] - range[0]);
} 

/**
 * Creates a function that generates random colors that fall into a given HSV range.
 *
 * @param {number[]}  [options.hRange=[0,1]] - the maximum range for generated hue
 * @param {number[]}  [options.sRange=[0,1]] - the maximum range for generated saturation
 * @param {number[]}  [options.vRange=[0,1]] - the maximum range for generated value
 * 
 * @returns {Function} that generates HSV colors
 */
export function hsvGenerator(options = {}) {
  let {
    hRange = [0, 255],
    sRange = [0, 255],
    vRange = [0, 255],
  } = options;

  return function() {
    return Colr().fromHsv(random(hRange), random(sRange), random(vRange));
  };
}

/**
 * Creates a function that generates random colors that fall into a given HSL range.
 *
 * @param {number[]}  [options.hRange=[0,1]] - the maximum range for generated hue
 * @param {number[]}  [options.sRange=[0,1]] - the maximum range for generated saturation
 * @param {number[]}  [options.lRange=[0,1]] - the maximum range for generated lightness
 * 
 * @returns {Function} that generates HSV colors
 */
export function hslGenerator(options = {}) {
  let {
    hRange = [0, 255],
    sRange = [0, 255],
    lRange = [0, 255],
  } = options;

  return function() {
    return Colr().fromHsl(random(hRange), random(sRange), random(lRange));
  };
}

function luminance(color) {
  let rgb = color.toRgbArray();
  return (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 255;
}

const TRIG_SCALE = Math.PI / 720;

const SIN_360 = _.range(360).map(v => Math.sin(v * TRIG_SCALE));
const COS_360 = _.range(360).map(v => Math.cos(v * TRIG_SCALE));
const L_RADIUS  = _.range(256).map(v => (127.5 - Math.abs(v - 127.5)) / 127.5);
const Z_SCALE   = 0.01;

function cssToHslArray(color) {
  return Colr().fromRgbArray(cssColor(color).toRgbaArray()).toHslArray();
}

export function restrictLuminance(generator, range) {
  return function() {
    let color, lum;
    do {
      color = generator();
      lum = luminance(color);
    } while (lum < range[0] || lum > range[1]);
    return color;
  };
}

function hslArrayToXyzArray(hsl) {
  let radius = L_RADIUS[hsl[2]] * hsl[1] * 0.01;
  return [
    COS_360[hsl[0]] * radius,
    SIN_360[hsl[0]] * radius,
    hsl[2] * Z_SCALE,
  ];
}

function distSq(a, b) {
  let dx = a[0] - b[0];
  let dy = a[1] - b[1];
  let dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

export function generateColors(options = {}) {
  if (!options) {
    options = {};
  }

  let {
    numColors = 1,
    generator = hslGenerator(),
    exclude = ['#000000', '#ffffff'],
    numTries = 40,
  } = options;

  let result = [];

  let xyzColors = exclude.map(_.flow(cssToHslArray, hslArrayToXyzArray));

  while (result.length < numColors) {
    let best;
    let bestXyz;
    let bestDist = 0;
    if (!xyzColors.length) {
      best = generator();
      bestXyz = hslArrayToXyzArray(best.toHslArray());
    }
    else {
      for (let i = 0; i < numTries; i++) {
        let color = generator();
        let xyz = hslArrayToXyzArray(color.toHslArray());
        let minDist = 100000000;
        xyzColors.forEach(function(point) {
          minDist = Math.min(minDist, distSq(xyz, point));
        });
        if (minDist > bestDist) {
          best = color;
          bestXyz = xyz;
          bestDist = minDist;
        }
      }
    }
    xyzColors.push(bestXyz);
    result.push(best.toHex());
  }

  return result;
}