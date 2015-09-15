import Colr from 'colr';
import cssColor from 'css-color-converter';

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

function luminance(color) {
  let rgb = color.toRgbArray();
  return (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 255;
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
    generator = hsvGenerator(),
    exclude = ['#000000', '#ffffff'],
  } = options;

  exclude = exclude.map(color => cssColor(color).toRgbaArray());

  let target = exclude.length + numColors;

  while (exclude.length < target) {
    let best;
    let bestDist = 0;
    for (let i = 0; i < 20; i++) {
      let rgb = generator().toRgbArray();
      let minDist = 255 * 255 * 3;
      exclude.forEach(function(point) {
        minDist = Math.min(minDist, distSq(rgb, point));
      });
      if (minDist > bestDist) {
        best = rgb;
        bestDist = minDist;
      }
    }
    exclude.push(best);
  }

  return exclude.slice(-numColors).map(rgb => Colr().fromRgbArray(rgb).toHex());
}