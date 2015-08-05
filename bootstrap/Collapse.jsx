import React from 'react';
import classNames from 'classnames';
import callOnTransitionEnd from '../callOnTransitionEnd';

require('./Collapse.sass');

var doShow = Symbol();
var doHide = Symbol();

export default React.createClass({
  callOnTransitionEnd,
  propTypes: {
    component: React.PropTypes.any,
    open: React.PropTypes.bool,
    children: React.PropTypes.node,
  },
  getDefaultProps() {
    return {
      component: 'div',
    };
  },
  getInitialState() {
    return {
      open: !!this.props.open,
      collapsing: false,
      height: 0,
    };
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      this[doShow]();
    }
    if (!nextProps.open && this.props.open) {
      this[doHide](); 
    }
  },
  show() {
    if (this.props.open === undefined) {
      this[doShow]();
    }
  },
  [doShow]() {
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
    if (this.props.open === undefined) {
      this[doHide]();
    }
  },
  [doHide]() {
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
    if (this.props.open === undefined) {
      this.state.open ? this.hide() : this.show();
    }
  },
  stopCollapsing() {
    this.setState({
      collapsing: false,
      height: undefined,
    });
  },
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