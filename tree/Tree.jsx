import React, {Component, PropTypes} from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import classNames from 'classnames';

import Collapse from '../bootstrap/Collapse';
import CollapseIcon from '../CollapseIcon';

import './Tree.sass';

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
    depth:    PropTypes.number,
    expanded: PropTypes.bool,
    cell:     PropTypes.node.isRequired,
  }
  static defaultProps = {
    depth: 0,
    expanded: true,
  }
  render() {
    let {className, depth, expanded, cell, children} = this.props;
    let {basePadding, indent} = this.context;

    let hasChildren = !!React.Children.count(children);

    className = classNames(className, "mf-tree-node", {
      'mf-tree-node-branch': hasChildren,
    });

    return <div {...this.props} className={className}>
      <div className="mf-tree-node-cell" onClick={this.onClick}
        style={{paddingLeft: basePadding + depth * indent}}>
        {hasChildren && <CollapseIcon open={expanded}/>} {cell}
      </div>
      {hasChildren && <Collapse open={expanded}>
        {React.Children.map(children, child => child && 
          React.cloneElement(child, {depth: depth + 1}))}
      </Collapse>}
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
    return <TreeNode {...this.props} {...this.state} onClick={this.onClick}/>;
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
