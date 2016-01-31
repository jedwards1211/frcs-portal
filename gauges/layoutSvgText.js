import React from 'react';
import layoutText from '../utils/layoutText';

export default function layoutSvgText(text, {x, y, ascend, props, maxFontSize, centerVertically, ...args}) {
  let {lines, fontSize} = layoutText(text, args);
  if (maxFontSize) {
    fontSize = Math.min(fontSize, maxFontSize);
  }
  let {fontWeight, fontFamily} = args;

  if (centerVertically) {
    y -= Math.floor(lines.length / 2) * fontSize;
  }

  let result = lines.map((line, i) => (
    <text {...props} key={i} x={x} y={y + (ascend ? i + 1 - lines.length : i) * fontSize}
      style={{fontSize, fontWeight, fontFamily}}>
      {line}
    </text>
  ));
  result.fontSize = fontSize;
  return result;
}
