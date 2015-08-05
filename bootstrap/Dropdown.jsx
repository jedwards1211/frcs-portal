import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import firstDefined from '../firstDefined';

var DropdownToggle = React.createClass({
  propTypes: {
    open: React.PropTypes.bool,
    component: React.PropTypes.any.isRequired,
  },
  render() {
    var {component, open, children} = this.props;
    var props = _.clone(this.props);
    props['aria-haspopup'] = 'true';
    props['aria-expanded'] = open;
    return React.createElement(component, props, children);
  }
});

var DropdownMenu = React.createClass({
  propTypes: {
    component: React.PropTypes.any.isRequired,
  },
  render() {
    var {component, children, className} = this.props;
    var props = _.clone(this.props);
    props.className = classNames('dropdown-menu', className);
    return React.createElement(component, props, children);
  }
});

var Dropdown = React.createClass({
  propTypes: {
    /*
     * optional (overrides state.open if used)
     */
    open:               React.PropTypes.bool,
    closeOnInsideClick: React.PropTypes.bool,
  },
  getDefaultProps() {
    return {
      closeOnInsideClick: true,
    };
  },
  getInitialState() {
    return {
      open: false,
      component: React.PropTypes.any.isRequired,
    };
  },
  show() {
    this.setState({open: true});
  },
  hide() {
    this.setState({open: false});
  },
  onDropdownToggleClick() {
    this.setState({open: !this.state.open});
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.open !== undefined && nextProps.open === undefined) {
      this.setState({open: this.props.open});
    }
  },
  componentDidUpdate() {
    if (this.state.open && !this.isDocumentClickInstalled) {
      document.addEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = true;
    }
    else if (!this.state.open && this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }
  },
  componentWillUnmount() {
    if (this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }
  },
  onDocumentClick(e) {
    function isDescendant(el, ancestor) {
      while (el && el !== document.body.parentElement) {
        if (el === ancestor) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    if (this.props.closeOnInsideClick || 
      !isDescendant(e.target, React.findDOMNode(this.refs.dropdown))) {
      this.setState({open: false});
    }
  },
  render() {
    var {className, component, openClassName, children} = this.props;
    var open = firstDefined(this.props.open, this.state.open);
    var props = _.clone(this.props);

    props.className = classNames(className, 'dropdown', {open: open}, openClassName && {openClassName: open});
    props.ref = 'dropdown';

    children = React.Children.map(children, child => {
      if (child.type === DropdownToggle) {
        var onClick = child.props.onClick ? 
          () => {
            child.props.onClick();
            this.onDropdownToggleClick();
          } 
          : 
          this.onDropdownToggleClick;

        return React.cloneElement(child, {open, onClick});
      }
      return child;
    });

    return React.createElement(component, props, children);
  } 
});

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;

export default Dropdown;

export { Dropdown, DropdownMenu , DropdownToggle };