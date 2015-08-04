import React from 'react';
import classNames from 'classnames';
import TransitionMixin from './TransitionMixin';

require('./Collapse.sass');

export default React.createClass({
  mixins: [TransitionMixin],
  propTypes: {
    component: React.PropTypes.any,
    initOpen: React.PropTypes.bool,
    forceOpen: React.PropTypes.bool,
    children: React.PropTypes.node,
  },
  getDefaultProps() {
    return {
      component: 'div',
    };
  },
  getInitialState() {
    return {
      open: 'forceOpen' in this.props ? this.props.forceOpen : this.props.initOpen,
      collapsing: false,
      height: 0,
    };
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.forceOpen && !this.props.forceOpen) {
      this.show();
    }
    if (!nextProps.forceOpen && this.props.forceOpen) {
      this.hide(); 
    }
  },
  show() {
    if (!this.state.open) {
      this.setState({
        open: true,
        collapsing: true,
        height: 0,
      }, () => {
        var content = React.findDOMNode(this.refs.collapse);
        this.setState({height: content.scrollHeight});
        this.callOnTransitionEnd(
          React.findDOMNode(this.refs.collapse), this.stopCollapsing, 350);
      });
    }
  },
  hide() {
    if (this.state.open) {
      var content = React.findDOMNode(this.refs.collapse);
      this.setState({
        height: content.offsetHeight,
      }, () => {
        content.offsetHeight; // force reflow
        this.setState({
          open: false,
          collapsing: true,
        }, () => {
          content.offsetHeight; // force reflow
          this.setState({height: 0});
          this.callOnTransitionEnd(
            React.findDOMNode(this.refs.collapse), this.stopCollapsing, 350);
        });
      });
    }
  },
  toggle() {
    this.state.open ? this.hide() : this.show();
  },
  stopCollapsing() {
    this.setState({
      collapsing: false,
      height: undefined,
    });
  },
  // componentDidUpdate() {
  //   var content = React.findDOMNode(this.refs.collapse);
  //   content.offsetHeight; // force reflow
  //   var newHeight = this.state.open ? content.scrollHeight : 0;
  //   if (this.state.height !== newHeight) {
  //     this.setState({height: newHeight});
  //   }
  // },
  render() {
    var {component, className, children, ...props} = this.props;
    var {open, collapsing, height} = this.state;
    props.className = classNames(className, {'collapse': !collapsing, 'in': open && !collapsing, collapsing: collapsing});
    if (height) {
      if (!props.style) props.style = {};
      props.style.height = height;
    }
    props.ref = 'collapse';
    props['aria-expanded'] = open;

    return React.createElement(component, props, children);
  },
});