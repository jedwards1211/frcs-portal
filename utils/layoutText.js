/* eslint-disable no-console */

import dummyCanvas from './dummyCanvas';
import _ from 'lodash';

function splitWithMatchedSeps(text: string, splitRegExp: RegExp) {
  let parts = [];
  let separators = [];
  let match, lastMatchEnd = 0;
  while ((match = splitRegExp.exec(text))) {
    parts.push(text.substring(lastMatchEnd, match.index));
    separators.push(match[0]);
    lastMatchEnd = match.index + match[0].length;
  }
  if (lastMatchEnd < text.length) {
    parts.push(text.substring(lastMatchEnd));
  }
  return {parts, separators};
}

/**
 * Determines the maximum font size that can fit the given text within the given
 * maximum width and height in a multiline flow layout.
 *
 * @param{string|string[]} text - the text to lay out.  If you give a single string,
 *    it will be split with splitRegExp.  Otherwise, you may give an array of parts,
 *    which won't be split further.
 * @param{RegExp} [options.splitRegExp=/\s+/g] - use to split text if it is a string
 * @param{string[]=} [options.separators] - separator[i] comes after text[i]
 * @param{string} [options.fontWeight] - the CSS font-weight to use
 * @param{string} [options.fontFamily] - the CSS font-family to use
 * @param{number} [options.maxWidth] - the maximum width to fit text in
 * @param{number} [options.maxHeight] - the maximum height to fit text in
 * @param{boolean} [options.log] - whether to log algorithm steps (for debugging)
 */
export default function layoutText(text: string | Array<string>, options: {
  splitRegExp: RegExp,
  separators: Array<string>,
  fontWeight: string, 
  fontFamily: string, 
  maxWidth: number, 
  maxHeight: number, 
  log: boolean
}) : {lineStarts: Array<string>, fontSize: number} {
  let {splitRegExp, separators, fontWeight, fontFamily, maxWidth, maxHeight, log} = options;
  let ctx = dummyCanvas.getContext('2d');
  let baseFontSize = maxHeight;
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`;

  // determines the font size that would shrink lines with the given widths and height = baseFontSize
  // down to fit within maxWidth/maxHeight
  function calcFontSize(lineWidths) {
    return Math.min(maxHeight / lineWidths.length, baseFontSize * maxWidth / _.max(lineWidths));
  }

  let parts;
  if (typeof text === 'string') {
    let split = splitWithMatchedSeps(text, splitRegExp || /\s+/g);
    parts = split.parts;
    separators = split.separators;
  }
  else {
    parts = text;
    if (!separators) {
      separators = parts.map(p => ' ');
    }
  }
  let partWidths = parts.map(part => ctx.measureText(part).width);
  // surround separators in | | and then subtract out their width, because measureText 
  // seems return zero width for pure whitespace
  let pipeWidth = ctx.measureText('||').width;
  let separatorWidths = separators.map(separator => ctx.measureText(`|${separator}|`).width - pipeWidth);
  // the total width of the text on one line with fontSize = baseFontSize
  let width = _.sum(partWidths) + _.sum(separatorWidths);
  // each line is the index of the part that starts that line
  // last element is not the start of a line, but rather the last part index + 1
  let lineStarts = [0, parts.length];
  let lineWidths = [width];
  let fontSize = calcFontSize(lineWidths);

  // finds next smaller width such that only one of the lineStarts doesn't fit
  // in the current layout
  function findNextWidth() {
    return _.max(lineWidths.map((lineWidth, index) => {
      let firstPart = lineStarts[index];
      let lastPart = lineStarts[index + 1] - 1;
      if (lineWidth >= width && firstPart < lastPart) {
        return lineWidth - partWidths[lastPart];
      }
      return lineWidth;
    }));
  }

  // HOW THIS ALGORITHM WORKS
  // we begin with all the parts on one line.

  // we then gradually shrink the available width (each shrink is calculated to
  // nudge one part to the next line) and reflow the parts each time.

  // then we compute the font size that would fit the reflowed text within the
  // maxWidth and maxHeight limits.

  // the font size should increase until there are too many lineStarts to fit in
  // the vertical space, or all parts are on one line.

  let iteration = 0;
  let nextWidth;
  while ((nextWidth = findNextWidth()) < width) {
    if (log) {
      console.log('iteration:       ', iteration);
      console.log('  before:');
      console.log('    fontSize:    ', fontSize);
      console.log('    width:       ', width);
      console.log('    lineStarts:  ', lineStarts);
      console.log('    lineWidths:  ', lineWidths);
    }

    iteration++;

    // re-layout the parts into lines no longer than nextWidth
    let nextLineStarts = _.clone(lineStarts);
    let nextLineWidths = _.clone(lineWidths);
    if (partWidths[0] <= nextWidth) {
      for (var line = 0; line < nextLineWidths.length; line++) {
        let firstPart = nextLineStarts[line];
        let lastPart = nextLineStarts[line + 1] - 1;
        while (nextLineWidths[line] > nextWidth) {
          if (firstPart === lastPart) {
            //can't shrink any more
            break;
          }
          // remove the last part from the current line
          nextLineWidths[line] -= partWidths[lastPart] + separatorWidths[lastPart - 1];
          if (line === nextLineWidths.length - 1) {
            // add the last part to a new line
            nextLineWidths.push(partWidths[lastPart]);
            nextLineStarts.splice(line + 1, 0, lastPart);
          }
          else {
            // add the last part to the next line
            nextLineWidths[line + 1] += partWidths[lastPart] + separatorWidths[lastPart];
            nextLineStarts[line + 1] = lastPart;
          }
          lastPart--;
        }
      }
    }

    // did we break because a single part was longer than nextWidth?
    if (i < parts.length) {
      if (log) {
        console.log("  parts didn't fit");
      }
      break;
    }

    // does this layout fit with fontSize >= the last one's?
    let nextFontSize = calcFontSize(nextLineWidths);
    if (log) {
      console.log('  nextFontSize:    ', nextFontSize);
    }
    if (nextFontSize < fontSize) {
      break;
    }

    // it fits; continue to the next iteration
    fontSize = nextFontSize; 
    lineStarts = nextLineStarts;
    lineWidths = nextLineWidths;
    width = _.max(lineWidths);
    if (log) {
      console.log('  after:');
      console.log('    fontSize:    ', fontSize);
      console.log('    width:       ', width);
      console.log('    lineStarts:  ', lineStarts);
      console.log('    lineWidths:  ', lineWidths);
    }
  }

  // rebuild the text of the laid-out lines
  let lines = [];
  for (var i = 1; i < lineStarts.length; i++) {
    let lineStart = lineStarts[i - 1];
    let lineEnd   = lineStarts[i];
    lines.push(parts.slice(lineStart, lineEnd).map(
      (part, index) => index === 0 ? part : separators[lineStart + index - 1] + part).join(''));
  }

  return {fontSize, lines};
}
