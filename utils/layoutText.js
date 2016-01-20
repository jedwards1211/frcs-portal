/* eslint-disable no-console */

import dummyCanvas from './dummyCanvas';
import _ from 'lodash';

function splitWithMatchedSeps(text: string, splitRegExp: RegExp) {
  let parts = [];
  let separators = [];
  let match, lastMatchEnd;
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
}) : {lines: Array<string>, fontSize: number} {
  let {splitRegExp, separators, fontWeight, fontFamily, maxWidth, maxHeight, log} = options;
  let ctx = dummyCanvas.getContext('2d');
  let baseFontSize = maxHeight;
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`;

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
  let pipeWidth = ctx.measureText('||').width;
  let separatorWidths = separators.map(separator => ctx.measureText(`|${separator}|`).width - pipeWidth);
  let width = _.sum(partWidths) + _.sum(separatorWidths);
  // each line is an array of part indices
  let lines = [_.range(parts.length)];
  let lineWidths = [width];
  let fontSize = calcFontSize(lineWidths);

  // finds next smaller width such that only one of the lines doesn't fit
  // in the current layout
  function findNextWidth() {
    return _.max(lineWidths.map((lineWidth, index) => {
      let line = lines[index];
      if (lineWidth >= width && line.length > 1) {
        return lineWidth - partWidths[line[line.length - 1]];
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

  // the font size should increase until there are too many lines to fit in
  // the vertical space, or all parts are on one line.

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

    // re-layout the parts into lines no longer than nextWidth
    let nextLines = [[0]];
    let nextLineWidths = [partWidths[0]];
    if (partWidths[0] <= nextWidth) {
      let line = 0;
      for (var i = 1; i < parts.length; i++) {
        let partWidth = partWidths[i];
        let nextLineWidth = nextLineWidths[line] + separatorWidths[i - 1] + partWidth;
        if (nextLineWidth > nextWidth) {
          if (partWidth > nextWidth) {
            // can't shrink width any more
            break;
          }
          line++;
          nextLines.push([i]);
          nextLineWidths.push(partWidth);
        }
        else {
          nextLines[line].push(i);
          nextLineWidths[line] = nextLineWidth;
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
    lines: lines.map(line => line.map(
      (partIndex, index) => index === 0 ? parts[partIndex] : separators[partIndex - 1] + parts[partIndex]).join('')),
  };
}
