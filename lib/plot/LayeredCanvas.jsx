import React from 'react/addons';
import _ from 'lodash';

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
    return {
      width: root.offsetWidth,
      height: root.offsetHeight
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
    var {width, height} = this.state;
    return <div ref="root" {...this.props}>
      <canvas ref="canvas" width={width} height={height}/>
    </div>;
  }
});