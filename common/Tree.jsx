import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';

import Autocollapse from './Autocollapse';
import CollapseIcon from './CollapseIcon';
import propAssign from '../utils/propAssign';

import './Tree.sass';

class TreeCell extends Component {
  render() {
    let {hasChildren, expanded, children} = this.props;
    return <div {...this.props}>
      {hasChildren && <CollapseIcon open={expanded}/>} {children}
    </div>;
  }
}

class TreeNode extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  static contextTypes = {
    basePadding: PropTypes.number,
    indent:      PropTypes.number,
  }
  static defaultContextTypes = {
    basePadding: 7,
    indent:      15,
  }
  static propTypes = {
    depth:      PropTypes.number,
    expanded:   PropTypes.bool,
    cell:       PropTypes.node,
  }
  static defaultProps = {
    depth: 0,
    expanded: true,
  }
  render() {
    let {className, depth, expanded, cell, children} = this.props;
    let {basePadding, indent} = this.context;

    let childArray = React.Children.toArray(children);
    if (!cell) cell = childArray.find(child => child.type === TreeCell);
    let childNodes = childArray.filter(child => child.type === TreeNode);
    let otherChildren = childArray.filter(child => child.type !== TreeNode && child.type !== TreeCell);
    let hasChildren = !!childNodes.length;

    className = classNames(className, "mf-tree-node", {
      'mf-tree-node-branch': hasChildren,
    });

    let paddingLeft = basePadding + depth * indent;

    if (cell || cell === 0) {
      if (!React.isValidElement(cell)) {
        cell = <TreeCell>{cell}</TreeCell>;
      }
      cell = React.cloneElement(cell, {
        className: classNames(cell.props.className, 'mf-tree-node-cell'),
        hasChildren,
        expanded,
        style: propAssign(cell.props.style, {paddingLeft}),
      });
    }

    return <div {...this.props} className={className}>
      {cell}
      <Autocollapse>
        {expanded && childNodes.map(child => React.cloneElement(child, {depth: depth + 1}))}
      </Autocollapse>
      {!!otherChildren.length && <div style={{paddingLeft}}>
        {otherChildren}
      </div>}
    </div>;
  }
}

class AutoTreeNode extends Component {
  static propTypes = {
    depth:        PropTypes.number,
    initExpanded: PropTypes.bool,
    cell:         PropTypes.node.isRequired,
  }
  static defaultProps = {
    initExpanded: true,
  }
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.initExpanded,
    };
  }
  onClick = () => {
    this.setState({expanded: !this.state.expanded});
  }
  render() {
    let {cell} = this.props;
    let {onClick} = this;

    if (!React.isValidElement(cell)) {
      cell = <TreeCell>{cell}</TreeCell>;
    }
    cell = React.cloneElement(cell, {onClick});

    return <TreeNode {...this.props} {...this.state} cell={cell}/>;
  }
}

export default class Tree extends Component {
  static propTypes = {
    basePadding:  PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
  }
  static defaultProps = {
    basePadding: 7,
    indent:      15,
    className:   'mf-tree-default',
  }
  static childContextTypes = {
    basePadding:  PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
  }
  getChildContext() {
    let {basePadding, indent} = this.props;
    return {basePadding, indent};
  }
  render() {
    let {className, children} = this.props;

    className = classNames(className, 'mf-tree');

    return <div {...this.props} className={className}>
      {children}
    </div>;
  }
}

Tree.Node = TreeNode;
Tree.Node.Auto = AutoTreeNode;
Tree.Cell = TreeCell;
