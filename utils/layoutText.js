/* eslint-disable no-console */

import dummyCanvas from './dummyCanvas';
import _ from 'lodash';

export default function layoutText(text: string | Array<string>, options: {
  fontWeight: string, 
  fontFamily: string, 
  maxWidth: number, 
  maxHeight: number, 
  minFontSize: number, 
  log: boolean
}) : {lines: Array<string>, fontSize: number} {
  let {fontWeight, fontFamily, maxWidth, maxHeight, minFontSize, log} = options;
  let ctx = dummyCanvas.getContext('2d');
  ctx.font = `${fontWeight} ${maxHeight}px ${fontFamily}`;

  let segments = typeof text === 'string' ? text.split(/\s+/) : text;
  let startWidth = ctx.measureText(segments.join(' ')).width;
  let fontSize = Math.min(maxHeight, maxHeight * maxWidth / startWidth);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  let lines = [segments];
  let lineWidths = lines.map(line => ctx.measureText(line.join(' ')).width);
  let width = lineWidths[0];
  let iteration = 0;

  let nextWidth;
  let nextFontSize;
  let nextLines = lines;
  let nextLineWidths = lineWidths;

  function findNextWidth() {
    return _.max(nextLineWidths.map((lineWidth, index) => {
      let line = nextLines[index];
      if (lineWidth >= width && line.length > 1) {
        return lineWidth - ctx.measureText(line[line.length - 1]).width;
      }
      return lineWidth;
    }));
  }
  function findNextFontSize() {
    return Math.min(maxHeight / nextLines.length, fontSize * maxWidth / _.max(nextLineWidths)); 
  }

  while ((nextWidth = findNextWidth()) < width && 
         (nextFontSize = findNextFontSize()) >= fontSize) {
    lines = nextLines;
    lineWidths = nextLineWidths;
    if (log) {
      console.log('iteration:    ', iteration);
      console.log('  lines:      ', lines);
      console.log('  fontSize:   ', fontSize);
      console.log('  lineWidths: ', lineWidths);
      console.log('  width:      ', width);
    }
    iteration++;
    fontSize = nextFontSize;
    width = nextWidth;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    let segmentWidths = segments.map(segment => ctx.measureText(segment).width);
    let nextLineWidth = 0;
    let nextLine = [];
    nextLines = [nextLine];
    nextLineWidths = [];
    let failed = false;
    for (let s = 0; s < segments.length; s++) {
      let segment = segments[s];
      let segmentWidth = segmentWidths[s];
      if (nextLineWidth + segmentWidth > width) {
        if (segmentWidth > width) {
          failed = true;
          break;
        }
        nextLineWidths.push(nextLineWidth);
        nextLineWidth = 0;
        nextLine = [];
        nextLines.push(nextLine);
      }
      nextLine.push(segment);
      nextLineWidth += segmentWidth;
    }
    if (failed) break;
    nextLineWidths.push(nextLineWidth);
  }

  if (log) {
    console.log('iteration:    ', iteration, '(failed)');
    console.log('  lines:      ', nextLines);
    console.log('  fontSize:   ', fontSize);
    console.log('  lineWidths: ', nextLineWidths);
    console.log('  width:      ', width);
  }

  return {
    fontSize,
    lines: lines.map(segments => segments.join(' ')),
  };
}
