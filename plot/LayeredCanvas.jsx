import React from 'react/addons';
import _ from 'lodash';

require('./LayeredCanvas.sass');

export default React.createClass({
  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    layers: React.PropTypes.arrayOf(React.PropTypes.shape({
      paint: React.PropTypes.func.isRequired, 
    }).isRequired).isRequired,
  },
  getInitialState() {
    return {
      width: undefined,
      height: undefined,
    };
  },
  getRootSize() {
    var root = React.findDOMNode(this.refs.root);
    var style = window.getComputedStyle(root);
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
    };
  },
  onResize: function() {
    var size = this.getRootSize();
    if (size.width  !== this.state.width ||
        size.height !== this.state.height) {
      this.setState(size);
    }
  },
  componentDidMount() {
    this.throttledOnResize = _.throttle(this.onResize, 50);
    window.addEventListener('resize', this.throttledOnResize);
    this.componentDidUpdate();
  },
  componentDidUpdate() {
    this.onResize();
    this.repaint();
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttledOnResize);
  },
  repaint() {
    var canvas = React.findDOMNode(this.refs.canvas);
    if (this.state.height && this.state.width) {
      this.props.layers.forEach(layer => layer.paint(canvas));
    }
  },
  render() {
    var {className} = this.props;
    var {width, height} = this.state;

    width |= 1;
    height |= 1;

    if (className) className += ' layered-canvas';
    else className = 'layered-canvas';
    return <div ref="root" className={className}>
      <canvas ref="canvas" width={width} height={height}/>
    </div>;
  }
});