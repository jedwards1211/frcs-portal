/* @flow */

import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';
import _ from 'lodash';

export type Node = {
  shouldUpdate: (node: any) => boolean,
  hasChildren: () => boolean,
  children: () => any,
  isExpanded: () => boolean,
};

import Autocollapse from './Autocollapse';
import CollapseIcon from './CollapseIcon';
import propAssign from '../utils/propAssign';

import './Tree.sass';

type TreeCellProps = {
  node?: Node,
  className?: string,
  hasChildren?: boolean,
  depth: number,
  expanded?: boolean,
  selected?: boolean,
  style?: Object,
  collapseIconProps?: Object,
  children?: any,
};

export class TreeCell extends Component<void,TreeCellProps,void> {
  static contextTypes = {
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired,
  };
  render(): ReactElement {
    let {node, className, hasChildren, depth, expanded, selected, style, collapseIconProps, children} = this.props;
    collapseIconProps = collapseIconProps || {};
    let {itemHeight, indent, collapseIconWidth} = this.context;
    let basePadding = collapseIconWidth - indent;

    if (node) {
      expanded = expanded || node.isExpanded();
      hasChildren = hasChildren || node.hasChildren();
      if (node.isSelected instanceof Function) {
        let flowWorkaround = node.isSelected;
        selected = selected || flowWorkaround.call(node);
      }
    }

    className = classNames(className, 'mf-tree-node-cell', {selected});

    return <div {...this.props} className={className} style={propAssign(style, {
      paddingLeft: basePadding + depth * indent,
      height: itemHeight,
      lineHeight: itemHeight + 'px'
    })}>
      {hasChildren && <CollapseIcon {...collapseIconProps} open={expanded} style={propAssign(collapseIconProps.style, {
        paddingLeft: basePadding,
        marginLeft: -basePadding,
        height: itemHeight,
        lineHeight: itemHeight + 'px',
        width: collapseIconWidth
      })}/>}{children}
    </div>;
  }
}

type TreeNodeProps = {
  node: Node,
  depth: number,
  renderNode: (node: Node, props: Object) => ReactElement,
};

class TreeNode extends Component<void,TreeNodeProps,void> {
  shouldComponentUpdate(nextProps) {
    return this.props.node.shouldUpdate(nextProps.node);
  }
  render(): ReactElement {
    let {node, renderNode, depth} = this.props;

    let hasChildren = node.hasChildren();

    let className = classNames("mf-tree-node", {
      'mf-tree-node-branch': hasChildren
    });

    return <div className={className}>
      {renderNode(node, {depth})}
      {hasChildren && <TreeChildren node={node} renderNode={renderNode} depth={depth}/>}
    </div>;
  }
}

type TreeChildrenProps = {
  node: Node,
  expanded?: boolean,
  depth: number,
  renderNode: (node: Node, props: Object) => ReactElement,
};

class TreeChildren extends Component<void,TreeChildrenProps,void> {
  shouldComponentUpdate(nextProps) {
    return this.props.node.shouldUpdate(nextProps.node);
  }
  render(): ReactElement {
    let {node, renderNode, expanded, depth} = this.props;

    return <Autocollapse>
      {(expanded || node.isExpanded()) && _.map(node.children(), (child, key) => {
        return <TreeNode key={key} pathKey={key} node={child} renderNode={renderNode} depth={depth + 1}/>;
      })}
    </Autocollapse>;
  }
}

type TreeProps = {
  itemHeight: number,
  indent: number,
  collapseIconWidth: number,
  className: string,
  root?: Node,
  renderNode: (node: Node, props: Object) => ReactElement,
};
type TreeDefaultProps = {
  itemHeight: number,
  indent: number,
  collapseIconWidth: number,
  className: string,
};

export default class Tree extends Component<TreeDefaultProps,TreeProps,void> {
  shouldComponentUpdate: (props: Object, state: void, context: Object) => boolean = shouldPureComponentUpdate;
  static Cell = TreeCell;
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
  getChildContext(): {
    itemHeight: number,
    indent: number,
    collapseIconWidth: number,
  } {
    let {itemHeight, indent, collapseIconWidth} = this.props;
    return {itemHeight, indent, collapseIconWidth};
  }
  render(): ReactElement {
    let {root, renderNode} = this.props;

    return <div {...this.props}>
      {root && <TreeChildren node={root} renderNode={renderNode} expanded={true} depth={-1}/>}
    </div>;
  }
}
