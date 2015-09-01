import React from 'react';
import arcPath from './arcPath';

require('./Spinner.sass');

export default React.createClass({
  propTypes: {
    size:   React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      size:   20,
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  },
  render() {
    var {period, size, className, pathStyle} = this.props;
    if (className) className += ' spinner';
    else className = 'spinner';

    var radius = size * 0.5;
    var thickness = Math.max(2, radius * 0.2);

    return <svg {...this.props} viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet" className={className}>
      <path d={arcPath([radius, radius], [radius, radius], thickness, 0, 2)} style={pathStyle}/>
    </svg>;
  },
});
