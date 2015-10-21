import React, {PropTypes, Component} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import {leftSide, rightSide} from '../orient';
import callOnTransitionEnd from '../callOnTransitionEnd';
import fireFakeResizeEvent from '../utils/fireFakeResizeEvent';

import './SidebarView.sass';

export default class SidebarView extends Component {
  static propTypes = {
    sidebar:              PropTypes.node,
    sidebarOpen:          PropTypes.bool,
    content:              PropTypes.node,
    onOpenSidebarClick:   PropTypes.func,
    onCloseSidebarClick:  PropTypes.func,
    sidebarSide:          PropTypes.oneOf([leftSide, rightSide]),
    sidebarWidth:         PropTypes.number,
  }
  static defaultProps = {
    sidebarOpen: true,
    sidebarSide: leftSide,
    sidebarWidth: 200,
    onOpenSidebarClick: function() {},
    onCloseSidebarClick: function() {},
  }
  constructor(props) {
    super(props);
    this.state = {rootWidth: 0};
  }
  onSidebarToggleBtnClick = () => {
    let {sidebarOpen, onOpenSidebarClick, onCloseSidebarClick} = this.props;
    sidebarOpen ? onCloseSidebarClick() : onOpenSidebarClick();
    callOnTransitionEnd(this.refs.sidebar, fireFakeResizeEvent, 1000);
  }
  resize = _.throttle(() => {
    if (this.refs.root && this.refs.sidebarToggleBtn) {
      this.setState({
        rootWidth:              this.refs.root.offsetWidth,
        sidebarToggleBtnWidth:  this.refs.sidebarToggleBtn.offsetWidth,
      });
    }
  }, 30)
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize); 
  }
  render() {
    let {className, sidebar, sidebarOpen, sidebarSide, sidebarWidth, 
        content, ...props} = this.props;
    let {rootWidth = 0, sidebarToggleBtnWidth = 0} = this.state;

    sidebarWidth = Math.min(sidebarWidth, rootWidth - sidebarToggleBtnWidth);

    let contentPosition = rootWidth > sidebarWidth * 2 && sidebarOpen ? sidebarWidth : 0;

    className = classNames(className, 'mf-sidebar-view', `mf-sidebar-${sidebarSide.name}`);

    const sidebarStyle = {
      width: sidebarWidth,
      [sidebarSide.name]: sidebarOpen ? 0 : -sidebarWidth,
    };

    const contentStyle = {
      ['margin' + sidebarSide.capName]: contentPosition,
    };

    var glyphTransform = sidebarOpen ? 'rotateY(0)' : 'rotateY(180deg)';

    const glyphStyle = {
      WebkitTransform: glyphTransform,
      MozTransform: glyphTransform,
      msTransform: glyphTransform,
      OTransform: glyphTransform,
      transform: glyphTransform,
    };

    return <div ref="root" className={className} {...props}>
      <div className="content" style={contentStyle}>{content}</div>
      <div ref="sidebar" className="mf-sidebar" style={sidebarStyle}>
        <div className="mf-sidebar-content">
          {sidebar}
        </div>
        <button ref="sidebarToggleBtn" className="btn btn-default mf-sidebar-toggle-btn" 
          type="button" onClick={this.onSidebarToggleBtnClick}>
          <i className="glyphicon glyphicon-chevron-left" style={glyphStyle}/>
        </button>
      </div>
    </div>;
  }
}