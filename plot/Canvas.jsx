import React from 'react/addons';
import _ from 'lodash';

require('./Canvas.sass');

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.resize  = _.throttle(this.doResize , 50);
    this.repaint = _.throttle(this.doRepaint, 20);
    this.state = {};
  }

  static propTypes = {
    onResize: React.PropTypes.func,
  }

  getRootSize() {
    var root = React.findDOMNode(this.refs.root);
    var style = window.getComputedStyle(root);
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
    };
  }
  doResize = () => {
    var size = this.getRootSize();
    var canvas = React.findDOMNode(this.refs.canvas);
    if (size.width  !== this.state.width ||
        size.height !== this.state.height) {
      // repaint immediately after resize to avoid flickering
      this.setState(size, () => this.doRepaint());
      if (this.props.onResize) this.props.onResize(size);
    }
  }
  doRepaint = () => {
    var canvas = React.findDOMNode(this.refs.canvas);
    for (var i = 0; i < React.Children.count(this.props.children); i++) {
      this.refs[i].paint(canvas); 
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.doResize();
    this.repaint();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  componentDidUpdate() {
    this.repaint();
  }
  render() {
    var {className, children} = this.props;
    var {width = 1, height = 1} = this.state;

    var refChildren = React.Children.map(this.props.children, 
      (child, index) => React.cloneElement(child, {ref: index}));

    if (className) className += ' canvas';
    else className = 'canvas';
    return <div ref="root" {...this.props} className={className}>
      <canvas ref="canvas" width={width} height={height}/>
      {refChildren}
    </div>;
  }
};

export class Layer extends React.Component {
  constructor(props) {
    super(props);
    if (!(this.paint instanceof Function)) throw new Error('you must provide a paint() method');
  }
  render() {
    return <span/>;
  }
}
