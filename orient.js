import _ from 'lodash';

export function Side(props) {
  _.assign(this, props);
}

export var leftSide = new Side({
  name: 'left',
  offsetName: 'offsetLeft',
  direction: -1,
});
export var rightSide = new Side({
  name: 'right',
  offsetName: 'offsetRight',
  direction: 1,
});
export var topSide = new Side({
  name: 'top',
  offsetName: 'offsetTop',
  direction: -1,
});
export var bottomSide = new Side({
  name: 'bottom',
  offsetName: 'offsetBottom',
  direction: 1,
});

export var sides = {
  left: leftSide,
  right: rightSide,
  top: topSide,
  bottom: bottomSide
};

export function Axis(props) {
  _.assign(this, props);
}

export var xAxis = new Axis({
  name: 'x',
  clientName: 'clientX',
  pageName: 'pageX',
  screenName: 'screenX',
  span: 'width',
  offsetSpan: 'offsetWidth',
  scrollSpan: 'scrollWidth',
  index: 0,
});
export var yAxis = new Axis({
  name: 'y',
  clientName: 'clientY',
  pageName: 'pageY',
  screenName: 'screenY',
  span: 'height',
  offsetSpan: 'offsetHeight',
  scrollSpan: 'scrollHeight',
  index: 1
});

export var axes = {
  x: xAxis,
  y: yAxis
};

xAxis.opposite = yAxis;
yAxis.opposite = xAxis;

leftSide.opposite = rightSide;
rightSide.opposite = leftSide;
topSide.opposite = bottomSide;
bottomSide.opposite = topSide;

leftSide.axis = rightSide.axis = xAxis;
topSide.axis = bottomSide.axis = yAxis;

xAxis.loSide = xAxis.lowSide = xAxis.minSide = leftSide;
xAxis.hiSide = xAxis.highSide = xAxis.maxSide = rightSide;
yAxis.loSide = yAxis.lowSide = yAxis.minSide = topSide;
yAxis.hiSide = yAxis.highSide = yAxis.maxSide = bottomSide;