import React from 'react';

import {Layer} from './Canvas';

export default class CanvasClearer extends Layer {
  paint(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}