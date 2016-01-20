import React from 'react';
import layoutText from '../utils/layoutText';

export default function layoutSvgText(text, {x, y, ascend, props, ...args}) {
  let {lines, fontSize} = layoutText(text, args);

  return lines.map((line, i) => (
    <text {...props} key={i} x={x} y={y + (ascend ? i + 1 - lines.length : i) * fontSize} style={{fontSize}}>
      {line}
    </text>
  ));
}
