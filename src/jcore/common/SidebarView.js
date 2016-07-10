import React, {PropTypes, Component} from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import {leftSide, rightSide} from '../utils/orient'
import callOnTransitionEnd from '../transition/callOnTransitionEnd'
import fireFakeResizeEvent from '../utils/fireFakeResizeEvent'

import './SidebarView.sass'

export default class SidebarView extends Component {
  static propTypes = {
    sidebar:              PropTypes.node,
    sidebarOpen:          PropTypes.bool,
    content:              PropTypes.node,
    onOpenSidebarClick:   PropTypes.func,
    onCloseSidebarClick:  PropTypes.func,
    onSidebarOpenChange: PropTypes.func,
    sidebarSide:          PropTypes.oneOf([leftSide, rightSide]),
    sidebarWidth:         PropTypes.number,
    overlapToggleButton:  PropTypes.bool,
    isNarrow:             PropTypes.func,
  };
  static defaultProps = {
    sidebarSide: leftSide,
    sidebarWidth: 200,
    overlapToggleButton: true,
    onOpenSidebarClick: function() {},
    onCloseSidebarClick: function() {},
    onSidebarOpenChange: function() {},
  };
  constructor(props) {
    super(props)
    this.state = {rootWidth: 0}
  }
  onSidebarToggleBtnClick = () => {
    let {onOpenSidebarClick, onCloseSidebarClick, onSidebarOpenChange} = this.props
    let sidebarOpen = this.isSidebarOpen()
    sidebarOpen ? onCloseSidebarClick() : onOpenSidebarClick()
    onSidebarOpenChange(!sidebarOpen)
    callOnTransitionEnd(this.refs.sidebar, fireFakeResizeEvent, 1000)
  };
  resize = _.throttle(() => {
    if (this.refs.root && this.refs.sidebarToggleBtn) {
      this.setState({
        rootWidth:              this.refs.root.offsetWidth,
        sidebarToggleBtnWidth:  this.refs.sidebarToggleBtn.offsetWidth,
      })
    }
  }, 30);
  componentWillMount() {
    this.canSetState = true
    this.setState({
      mounted: false,
      laidOut: false,
    })
  }
  componentDidMount() {
    this.resize()
    window.addEventListener('resize', this.resize)
  }
  componentWillUnmount() {
    this.canSetState = false
    window.removeEventListener('resize', this.resize)
  }
  setState(...args) {
    if (this.canSetState) {
      super.setState(...args)
    }
  }
  componentDidUpdate() {
    let {mounted, laidOut} = this.state
    if (!laidOut) {
      if (!mounted) {
        setTimeout(() => this.setState({mounted: true}), 0)
      }
      else {
        setTimeout(() => this.setState({laidOut: true}), 0)
      }
    }
  }
  isNarrow() {
    let {props: {isNarrow: _isNarrow, sidebarWidth}, state: {rootWidth}} = this
    rootWidth = rootWidth || 0
    if (_isNarrow) {
      return _isNarrow(this.props, this.state)
    }
    return rootWidth < sidebarWidth * 2
  }
  isSidebarOpen() {
    let {sidebarOpen} = this.props
    return sidebarOpen === undefined ? !this.isNarrow() : sidebarOpen
  }
  render() {
    let {className, sidebar, sidebarSide, sidebarWidth,
        content, overlapToggleButton, ...props} = this.props
    let {mounted, laidOut, rootWidth, sidebarToggleBtnWidth} = this.state
    let sidebarOpen = this.isSidebarOpen()
    rootWidth = rootWidth || 0
    sidebarToggleBtnWidth = sidebarToggleBtnWidth || 0

    sidebarWidth = Math.min(sidebarWidth, rootWidth - sidebarToggleBtnWidth)

    let contentPosition = !this.isNarrow() && sidebarOpen ? sidebarWidth : 0

    if (!overlapToggleButton) {
      contentPosition += sidebarToggleBtnWidth
    }

    className = classNames(className, 'mf-sidebar-view', `mf-sidebar-${sidebarSide.name}`,
      {'laid-out': laidOut, 'sidebar-open': sidebarOpen})

    const sidebarStyle = {
      width: sidebarWidth,
      [sidebarSide.name]: sidebarOpen ? 0 : -sidebarWidth,
    }

    const contentStyle = {
      ['margin' + sidebarSide.capName]: contentPosition,
    }

    var glyphTransform = sidebarOpen ? 'rotateY(0)' : 'rotateY(180deg)'

    const glyphStyle = {
      WebkitTransform: glyphTransform,
      MozTransform: glyphTransform,
      msTransform: glyphTransform,
      OTransform: glyphTransform,
      transform: glyphTransform,
    }

    return <div ref="root" className={className} {...props}>
      {mounted && <div ref="content" className="content" style={contentStyle}>{content}</div>}
      <div ref="sidebar" className="mf-sidebar" style={sidebarStyle}>
        <div ref="sidebarScroller" className="mf-sidebar-content">
          {sidebar && React.cloneElement(sidebar, {ref: 'sidebarContent'})}
        </div>
        <button ref="sidebarToggleBtn" className="btn btn-default mf-sidebar-toggle-btn"
            type="button" onClick={this.onSidebarToggleBtnClick}
        >
          <i className="glyphicon glyphicon-chevron-left" style={glyphStyle} />
        </button>
      </div>
    </div>
  }
}