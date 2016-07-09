import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import './Canvas.sass'

export default class Canvas extends React.Component {
  constructor(props) {
    super(props)
    this.mounted = false
    this.resize  = _.throttle(this.doResize, 50)
    this.repaint = _.throttle(this.doRepaint, 20)
    this.state = {}
  }

  static propTypes = {
    onResize: React.PropTypes.func,
  };

  getRootSize() {
    var root = this.refs.root
    var style = getComputedStyle(root)
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
    }
  }
  doResize = () => {
    if (!this.mounted) return
    var size = this.getRootSize()
    if (size.width  !== this.state.width ||
        size.height !== this.state.height) {
      // repaint immediately after resize to avoid flickering
      this.setState(size, () => this.doRepaint())
      if (this.props.onResize) this.props.onResize(size)
    }
  };
  doRepaint = () => {
    if (!this.mounted) return
    var canvas = ReactDOM.findDOMNode(this.refs.canvas)
    for (var i = 0; i < React.Children.count(this.props.children); i++) {
      var child = this.refs[i]
      if (child) child.paint(canvas)
    }
  };

  componentDidMount() {
    this.mounted = true
    window.addEventListener('resize', this.resize)
    this.doResize()
    this.repaint()
  }
  componentWillUnmount() {
    this.mounted = false
    window.removeEventListener('resize', this.resize)
  }

  componentDidUpdate() {
    this.resize()
    this.repaint()
  }
  render() {
    var {repaint} = this
    var {className, children} = this.props
    var {width = 1, height = 1} = this.state

    var refChildren = React.Children.map(children,
      (child, index) => child && React.cloneElement(child, {ref: index, repaint}))

    if (className) className += ' canvas'
    else className = 'canvas'
    return <div ref="root" {...this.props} className={className}>
      <canvas ref="canvas" width={width} height={height} />
      {refChildren}
    </div>
  }
}

export class Layer extends React.Component {
  constructor(props) {
    super(props)
    if (!(this.paint instanceof Function)) throw new Error('you must provide a paint() method')
  }
  render() {
    return <span />
  }
}
