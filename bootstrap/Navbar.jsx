import React from 'react';
import classNames from 'classnames';
import Collapse from './Collapse';
import {Link, History} from 'react-router';
import _ from 'lodash';

import addClass from '../wrappers/addClass';

import {element} from '../utils/domTraversal';

import './Navbar.sass';

let DefaultNavbarToggle = (props) => {
  var {className} = props;
  className = classNames(className, 'navbar-toggle');

  return <button type="button" {...props} className={className}>
    <span className="sr-only">Toggle navigation</span>
    <span className="icon-bar"></span>
    <span className="icon-bar"></span>
    <span className="icon-bar"></span>
  </button>;
}

export default class Navbar extends React.Component {
  static propTypes = {
    headerContent: React.PropTypes.any,
    navbarToggle:  React.PropTypes.node,
    expanded:      React.PropTypes.bool,
    onCollapse:    React.PropTypes.func,
    onExpand:      React.PropTypes.func,
  };
  static defaultProps = {
    navbarToggle: <DefaultNavbarToggle/>,
    onCollapse: function() {},
    onExpand: function() {},
  };
  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick, true);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true);
  }
  componentWillReceiveProps(nextProps) {
    let oldLocation = this.props.location;
    let newLocation = nextProps.location;
    if (this.props.expanded && oldLocation && newLocation &&
        (oldLocation.pathname !== newLocation.pathname ||
          !_.isEqual(oldLocation.query, newLocation.query))) {
      setTimeout(() => this.props.onCollapse(), 0);
    }
  }
  onDocumentClick = (e) => {
    if (this.props.expanded && 
        (!element(e.target).isDescendantOf(this.refs.navbar) ||
        element(e.target).isDescendantOf(ancestor => !!ancestor.href))) {
      this.props.onCollapse();
    }
  };
  toggle = () => {
    let {expanded, onCollapse, onExpand} = this.props;
    expanded ? onCollapse() : onExpand();
  };
  render() {
    let {className, children, headerContent, navbarToggle} = this.props;
    let expanded = !!this.props.expanded;

    className = classNames(className, 'navbar');

    return <nav ref="navbar" className={className}>
      <div className="View-fluid">
        <div className="navbar-header">
          {React.cloneElement(navbarToggle, {onClick: this.toggle})}
          {headerContent}
        </div>

        <Collapse component="div" ref="collapse" keepChildrenMounted={true} open={expanded} className="navbar-collapse">
          {children}
        </Collapse>
      </div>
    </nav>;
  }
}

Navbar.Nav = addClass('ul', 'nav navbar-nav');
Navbar.Nav.Right = addClass('ul', 'nav navbar-nav navbar-right');

Navbar.Nav.Link = React.createClass({
  mixins: [History],
  render() {
    var {to, params, query, className} = this.props;
    className = classNames(className, {active: this.history.isActive(to, params, query)});
    return <li><Link {...this.props} className={className}>{this.props.children}</Link></li>;
  },
});

export var NavLink = Navbar.Nav.Link;

Navbar.Brand = addClass(Link, 'navbar-brand');
