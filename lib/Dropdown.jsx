import React from 'react';
import classNames from 'classnames';

var DropdownToggle = React.createClass({
  propTypes: {
    open: React.PropTypes.bool,
    component: React.PropTypes.any.isRequired,
  },
  render() {
    var {component, open, children, ...props} = this.props;
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
    var {component, children, className, ...props} = this.props;
    props.className = classNames('dropdown-menu', className);
    return React.createElement(component, props, children);
  }
});

var Dropdown = React.createClass({
  propTypes: {
    closeOnInsideClick: React.PropTypes.bool,
    onDropdownOpened:   React.PropTypes.func,
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
  onDropdownToggleClick() {
    this.setState({
      open: !this.state.open,
    });
  },
  componentWillUpdate(nextProps, nextState) {
    if (!this.state.open && nextState.open) {
      this.opening = true;
    }
  },
  componentDidUpdate() {
    var justOpened = this.opening;
    this.opening = false;

    if (this.state.open && !this.isDocumentClickInstalled) {
      document.addEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = true;
    }
    else if (!this.state.open && this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }

    if (justOpened && this.props.onDropdownOpened) {
      this.props.onDropdownOpened();
    }
  },
  componentWillUnmount() {
    if (this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
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
      this.setState({
        open: false,
      });
    }
  },
  render() {
    var {className, component, openClassName, children, ...props} = this.props;
    var open = this.state.open;

    props.className = classNames("dropdown", className, {open: open});
    if (open) props.className += ' ' + openClassName;
    props.ref = "dropdown";

    children = React.Children.map(children, child => {
      if (child.type === DropdownToggle) {
        return React.cloneElement(child, {open: open, onClick: this.onDropdownToggleClick});
      }
      return child;
    });

    return React.createElement(component, props, children);
  } 
});

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;

export default Dropdown;

export { DropdownMenu , DropdownToggle };