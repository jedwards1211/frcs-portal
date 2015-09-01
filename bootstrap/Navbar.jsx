import React from 'react';
import classNames from 'classnames';
import Collapse from './Collapse';
import Dropdown from './Dropdown';
import {Link, State} from 'react-router';

import addClass from '../wrappers/addClass';

import './Navbar.sass';

class DefaultNavbarToggle extends React.Component {
  render() {
    var {className} = this.props;
    className = classNames(className, 'navbar-toggle');

    return <button type="button" {...this.props} className={className}>
      <span className="sr-only">Toggle navigation</span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
    </button>;
  }
}

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {collapseOpen: false};
  }
  static propTypes = {
    headerContent: React.PropTypes.any,
    navbarToggle:  React.PropTypes.node,
  }
  static defaultProps = {
    navbarToggle: <DefaultNavbarToggle/>,
  }
  static childContextTypes = {
    openNavbarCollapse:  React.PropTypes.func.isRequired,
    closeNavbarCollapse: React.PropTypes.func.isRequired,
  }
  getChildContext() {
    return {
      openNavbarCollapse:  this.openNavbarCollapse,
      closeNavbarCollapse: this.closeNavbarCollapse,
    };
  }
  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick, true);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true);
  }
  onDocumentClick = (e) => {
    function isDescendant(el, ancestor) {
      while (el && el !== document.body.parentElement) {
        if (el === ancestor) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    if (!isDescendant(e.target, React.findDOMNode(this.refs.navbar))) {
      this.closeNavbarCollapse();
    }
  }
  toggleNavbarCollapse = () => {
    this.setState({collapseOpen: !this.state.collapseOpen});
  }
  openNavbarCollapse = () => {
    this.setState({collapseOpen: true});
  }
  closeNavbarCollapse = () => {
    this.setState({collapseOpen: false});
  }
  render() {
    var {className, children, headerContent, navbarToggle} = this.props;
    var {collapseOpen} = this.state;

    className = classNames(className, 'navbar');

    return <nav ref="navbar" className={className}>
      <div className="container-fluid">
        <div className="navbar-header">
          {React.cloneElement(navbarToggle, {ref: 'navbarToggle', onClick: this.toggleNavbarCollapse})}
          {headerContent}
        </div>

        <Collapse component="div" ref="collapse" open={collapseOpen} className="navbar-collapse">
          {children}
        </Collapse>
      </div>
    </nav>;
  }
}

Navbar.Nav = addClass('ul', 'nav navbar-nav');
Navbar.Nav.Right = addClass('ul', 'nav navbar-nav navbar-right');

Navbar.Nav.Link = React.createClass({
  mixins: [State],
  render() {
    var {to, params, query, className} = this.props;
    className = classNames(className, {active: this.isActive(to, params, query)});
    return <li><Link {...this.props} className={className}>{this.props.children}</Link></li>;
  }
});

export var NavLink = Navbar.Nav.Link;

Navbar.Brand = addClass(Link, 'navbar-brand');
