/* eslint-disable no-console */

import dummyCanvas from './dummyCanvas';
import _ from 'lodash';

/**
 * Determines the maximum font size that can fit the given text within the given
 * maximum width and height in a multiline flow layout.
 *
 * Note: this algorithm currently collapses all whitespace to a single space.
 *
 * @param{string|string[]} text - the text to lay out.  If you give a single string,
 * this function may wrap it anywhere it contains whitespace.  If you give an array
 * of strings, this function will never wrap inside those strings.
 */
export default function layoutText(text: string | Array<string>, options: {
  fontWeight: string, 
  fontFamily: string, 
  maxWidth: number, 
  maxHeight: number, 
  log: boolean
}) : {lines: Array<string>, fontSize: number} {
  let {fontWeight, fontFamily, maxWidth, maxHeight, log} = options;
  let ctx = dummyCanvas.getContext('2d');
  let baseFontSize = maxHeight;
  let delimiter = ' ';
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`;

  function calcFontSize(lineWidths) {
    return Math.min(maxHeight / lineWidths.length, baseFontSize * maxWidth / _.max(lineWidths));
  }

  let delimiterWidth = ctx.measureText(delimiter).width;
  let segments = typeof text === 'string' ? text.split(/\s+/) : text;
  let segmentWidths = segments.map(segment => ctx.measureText(segment).width);
  let width = _.sum(segmentWidths) + (segmentWidths.length - 1) * delimiterWidth; 
  // each line is an array of segment indices
  let lines = [_.range(segments.length)];
  let lineWidths = [width];
  let fontSize = calcFontSize(lineWidths);

  // finds next smaller width such that only one of the lines doesn't fit
  // in the current layout
  function findNextWidth() {
    return _.max(lineWidths.map((lineWidth, index) => {
      let line = lines[index];
      if (lineWidth >= width && line.length > 1) {
        return lineWidth - segmentWidths[line[line.length - 1]];
      }
      return lineWidth;
    }));
  }

  // HOW THIS ALGORITHM WORKS
  // we begin with all the segments on one line.

  // we then gradually shrink the available width (each shrink is calculated to
  // nudge one segment to the next line) and reflow the segments each time.

  // then we compute the font size that would fit the reflowed text within the
  // maxWidth and maxHeight limits.

  // the font size should increase until there are too many lines to fit in
  // the vertical space, or all segments are on one line.

  let iteration = 0;
  let nextWidth;
  while ((nextWidth = findNextWidth()) < width) {
    if (log) {
      console.log('iteration:       ', iteration);
      console.log('  before:');
      console.log('    fontSize:    ', fontSize);
      console.log('    width:       ', width);
      console.log('    lines:       ', lines);
      console.log('    lineWidths:  ', lineWidths);
    }

    iteration++;

    // re-layout the segments into lines no longer than nextWidth
    let nextLines = [[]];
    let nextLineWidths = [0];
    let line = 0;
    for (var i = 0; i < segments.length; i++) {
      let segmentWidth = segmentWidths[i];
      let nextLineWidth = nextLineWidths[line] === 0 ?
        segmentWidth : nextLineWidths[line] + delimiterWidth + segmentWidth;
      if (nextLineWidth > nextWidth) {
        if (segmentWidth > nextWidth) {
          // can't shrink width any more
          break;
        }
        line++;
        nextLines.push([]);
        nextLineWidths.push(0);
      }
      else {
        nextLineWidths[line] = nextLineWidth;
      }
      nextLines[line].push(i);
    }

    // did we break because a single segment was longer than nextWidth?
    if (i < segments.length) {
      if (log) {
        console.log("  segments didn't fit");
      }
      break;
    }

    let nextFontSize = calcFontSize(nextLineWidths);
    if (log) {
      console.log('  nextFontSize:    ', nextFontSize);
    }

    if (nextFontSize < fontSize) {
      break;
    }
    fontSize = nextFontSize; 
    lines = nextLines;
    lineWidths = nextLineWidths;
    width = _.max(lineWidths);
    if (log) {
      console.log('  after:');
      console.log('    fontSize:    ', fontSize);
      console.log('    width:       ', width);
      console.log('    lines:       ', lines);
      console.log('    lineWidths:  ', lineWidths);
    }
  }

  return {
    fontSize,
    lines: lines.map(line => line.map(index => segments[index]).join(delimiter)),
  };
}
