import React from 'react';
import {Conversion, LinearConversion} from './andyplot';

export default React.createClass({
  propTypes: {
    xConversion: React.PropTypes.instanceOf(Conversion),
    yConversion: React.PropTypes.instanceOf(Conversion),
    onMove: React.PropTypes.func,
    children: React.PropTypes.node.isRequired,
  },
  onMouseDown(e) {
    if (e.button === 0) {
      var {xConversion, yConversion} = this.props;
      e.preventDefault();

      this.target = e.target;
      if (xConversion) this.startX = xConversion.invert(e.clientX - e.target.offsetLeft);
      if (yConversion) this.startY = yConversion.invert(e.clientY - e.target.offsetTop);
      this.startXConversion = xConversion;
      this.startYConversion = yConversion;

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp, true);
    }
  },
  onMouseMove(e) {
    e.preventDefault();

    var newXConversion, newYConversion;

    if (this.startXConversion) {
      var x = this.startXConversion.invert(e.clientX - this.target.offsetLeft);
      newXConversion = new LinearConversion(this.startXConversion.scale, this.startXConversion.offset - x + this.startX);
    }
    if (this.startYConversion) {
      var y = this.startYConversion.invert(e.clientY - this.target.offsetTop);
      newYConversion = new LinearConversion(this.startYConversion.scale, this.startYConversion.offset - y + this.startY);
    }

    if (this.props.onMove) {
      this.props.onMove(newXConversion, newYConversion);
    }
  },
  onMouseUp(e) {
    if (e.button === 0) {
      e.preventDefault();
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup'  , this.onMouseUp, true);
    }
  },
  onWheel(e) {
    e.preventDefault();

    var {xConversion, yConversion} = this.props;
    var wheelDirection = (e.detail < 0 || e.deltaY < 0) ? 1 : -1;

    var zoom = Math.pow(0.9, wheelDirection);
    var newXConversion, newYConversion;

    if (xConversion) {
      newXConversion = new LinearConversion(xConversion);
      newXConversion.zoom(xConversion.invert(e.clientX - e.target.offsetLeft), zoom);
    }
    if (yConversion) {
      newYConversion = new LinearConversion(yConversion);
      newYConversion.zoom(yConversion.invert(e.clientY - e.target.offsetTop), zoom);
    }
    if (this.props.onMove) {
      this.props.onMove(newXConversion, newYConversion);
    }
  },
  render() {
    return React.cloneElement(this.props.children, {
      ref: 'target',
      onMouseDown: this.onMouseDown,
      onWheel: this.onWheel,
    });
  },
});