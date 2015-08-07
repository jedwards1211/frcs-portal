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
      width: 200,
      height: 200,
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
  onResize: _.throttle(function() {
    var size = this.getRootSize();
    if (size.width  !== this.state.width ||
        size.height !== this.state.height) {
      this.setState(size);
    }
  }, 50),
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.componentDidUpdate();
  },
  componentDidUpdate() {
    this.onResize();
    this.repaint();
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  repaint() {
    var canvas = React.findDOMNode(this.refs.canvas);
    this.props.layers.forEach(layer => layer.paint(canvas));
  },
  render() {
    var {className} = this.props;
    var {width, height} = this.state;

    if (className) className += ' layered-canvas';
    else className = 'layered-canvas';
    return <div ref="root" className={className}>
      <canvas ref="canvas" width={width} height={height}/>
    </div>;
  }
});