import React from 'react';
import layoutText from '../utils/layoutText';

export default function layoutSvgText(text, {separators, minFontSize, 
  fontWeight, fontFamily, maxColumns, fontAspect, maxWidth, maxHeight, maxLineHeight, x, y, ascend, props}) {
  // let lines = [];
  // let i = 0;
  // let remaining = text;
  // if (!maxColumns) {
  //   maxColumns = maxWidth / minFontSize * fontAspect; 
  // }
  // // lines = [text];
  // while (remaining.length) {
  //   let k = 0;
  //   let line = '';
  //   while (remaining.length && k < separators.length && line.length < maxColumns) {
  //     let match = separators[k].exec(remaining);
  //     let nextPart;
  //     if (match) {
  //       nextPart = remaining.substring(0, match.index + match[0].length);
  //     }
  //     else {
  //       nextPart = remaining;
  //     }
  //     let nextLine = line + nextPart;
  //     if (nextLine.trim().length <= maxColumns) {
  //       line = nextLine;
  //       remaining = remaining.substring(nextPart.length);
  //     }
  //     else {
  //       k++;
  //       if (k >= separators.length || line) {
  //         break;
  //       }
  //     }
  //   }
  //   if (!line) {
  //     line = remaining;
  //     remaining = '';
  //   }
  //   lines.push(line);
  // }

  // let columns = 1;
  // lines.forEach(line => columns = Math.max(columns, line.length));

  // let fontSize = maxWidth / columns * fontAspect;
  // if (maxLineHeight) fontSize = Math.min(fontSize, maxLineHeight);
  // if (maxHeight) fontSize = Math.min(fontSize, maxHeight / lines.length);
  // if (minFontSize) fontSize = Math.max(fontSize, minFontSize);

  let {lines, fontSize} = layoutText(text, {
    fontWeight, fontFamily, maxWidth, maxHeight,  
  });

  return lines.map((line, i) => (
    <text {...props} key={i} x={x} y={y + (ascend ? i + 1 - lines.length : i) * fontSize} style={{fontSize}}>
      {line}
    </text>
  ));
}
