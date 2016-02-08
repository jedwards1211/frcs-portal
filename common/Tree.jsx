import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';

import Autocollapse from './Autocollapse';
import CollapseIcon from './CollapseIcon';
import propAssign from '../utils/propAssign';

import './Tree.sass';

class TreeCell extends Component {
  static contextTypes = {
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired,
  };
  render() {
    let {hasChildren, depth, expanded, style, collapseIconProps = {}, children} = this.props;
    let {itemHeight, indent, collapseIconWidth} = this.context;
    let basePadding = collapseIconWidth - indent;

    return <div {...this.props} style={propAssign(style, {
      paddingLeft: basePadding + depth * indent,
      height: itemHeight,
      lineHeight: itemHeight + 'px'
    })}>
      {hasChildren && <CollapseIcon open={expanded} style={propAssign(collapseIconProps.style, {
        paddingLeft: basePadding,
        marginLeft: -basePadding,
        height: itemHeight,
        lineHeight: itemHeight + 'px',
        width: collapseIconWidth
      })}/>}{children}
    </div>;
  }
}

class TreeNode extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;
  static propTypes = {
    depth:      PropTypes.number,
    expanded:   PropTypes.bool,
    cell:       PropTypes.node,
  };
  static defaultProps = {
    depth: 0,
    expanded: true,
  };
  render() {
    let {className, depth, expanded, cell, children} = this.props;

    let childArray = React.Children.toArray(children);
    if (!cell) cell = childArray.find(child => child.type === TreeCell);
    let childNodes = childArray.filter(child => child.type === TreeNode);
    let hasChildren = !!childNodes.length;

    className = classNames(className, "mf-tree-node", {
      'mf-tree-node-branch': hasChildren,
    });

    if (cell || cell === 0) {
      if (!React.isValidElement(cell)) {
        cell = <TreeCell>{cell}</TreeCell>;
      }
      cell = React.cloneElement(cell, {
        className: classNames(cell.props.className, 'mf-tree-node-cell'),
        hasChildren,
        depth,
        expanded,
      });
    }

    return <div {...this.props} className={className}>
      {cell}
      <Autocollapse>
        {expanded && childNodes.map(child => React.cloneElement(child, {depth: depth + 1}))}
      </Autocollapse>
    </div>;
  }
}

class AutoTreeNode extends Component {
  static propTypes = {
    depth:        PropTypes.number,
    initExpanded: PropTypes.bool,
    cell:         PropTypes.node.isRequired,
  };
  static defaultProps = {
    initExpanded: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.initExpanded,
    };
  }
  onClick = () => {
    this.setState({expanded: !this.state.expanded});
  };
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
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired,
  };
  static defaultProps = {
    itemHeight:  35,
    indent:      20,
    collapseIconWidth: 30,
    className:   'mf-tree-default',
  };
  static childContextTypes = {
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired,
  };
  getChildContext() {
    let {itemHeight, indent, collapseIconWidth} = this.props;
    return {itemHeight, indent, collapseIconWidth};
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
