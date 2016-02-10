/* @flow */

import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';
import _ from 'lodash';

import Autocollapse from './Autocollapse';
import CollapseIcon from './CollapseIcon';
import propAssign from '../utils/propAssign';

import './Tree.sass';

export type Node = {
  hasChildren: () => boolean,
  children: () => Array<Node> | {[key: string]: Node},
  isExpanded: () => boolean,
  isSelected?: () => boolean,
  shouldUpdate: (newNode: Node) => boolean,
};

export type BasicNodeData = {
  children: Array<BasicNodeData> | {[key: string]: BasicNodeData},
  expanded?: boolean,
  selected?: boolean,
};

export class BasicNode {
  data: BasicNodeData;
  model: any;

  constructor(data: BasicNodeData, model: any) {
    this.data = data;
    this.model = model;
  }

  shouldUpdate(newNode: BasicNode): boolean {
    return this.data !== newNode.data || this.model !== newNode.model;
  }

  hasChildren(): boolean {
    return !!(this.data.children && this.data.children.length);
  }

  children(): Array<BasicNode> | {[key: string]: BasicNode} {
    return _.map(this.data.children || [], child => new BasicNode(child, this.model));
  }

  isExpanded(): boolean {
    return !!this.data.expanded;
  }

  isSelected(): boolean {
    return !!this.data.selected;
  }
}

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
        selected = selected || node.isSelected();
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
  dispatch: ?(event: any, path: Array<string | number>) => ?any,
  pathKey: string | number,
  getPath: () => Array<string | number>,
};

class TreeNode extends Component<void,TreeNodeProps,void> {
  shouldComponentUpdate(nextProps) {
    return this.props.node.shouldUpdate(nextProps.node);
  }
  dispatch = (e, path = []) => {
    let {dispatch, pathKey} = this.props;
    if (dispatch) dispatch(e, [pathKey, ...path]);
  };
  getPath: () => Array<string | number> = () => {
    let {getPath, pathKey} = this.props;
    return getPath().concat(pathKey);
  };
  render(): ReactElement {
    let {node, renderNode, depth} = this.props;
    let {dispatch} = this;

    let hasChildren = node.hasChildren();

    let className = classNames("mf-tree-node", {
      'mf-tree-node-branch': hasChildren
    });

    return <div className={className}>
      {renderNode(node, {depth, dispatch, getPath: this.getPath})}
      {hasChildren && <TreeChildren node={node} renderNode={renderNode} getPath={this.getPath} dispatch={dispatch}
                                    depth={depth}/>}
    </div>;
  }
}

type TreeChildrenProps = {
  node: Node,
  expanded?: boolean,
  depth: number,
  renderNode: (node: Node, props: Object) => ReactElement,
  dispatch: ?(event: any, path: Array<string | number>) => ?any,
  getPath: () => Array<string | number>,
};

class TreeChildren extends Component<void,TreeChildrenProps,void> {
  shouldComponentUpdate(nextProps) {
    return this.props.node.shouldUpdate(nextProps.node);
  }
  render(): ReactElement {
    let {node, renderNode, expanded, depth, dispatch, getPath} = this.props;

    return <Autocollapse>
      {(expanded || node.isExpanded()) && _.map(node.children(), (child, key) => {
        return <TreeNode key={key} pathKey={key} node={child} renderNode={renderNode} depth={depth + 1}
                         dispatch={dispatch} getPath={getPath}/>;
      })}
    </Autocollapse>;
  }
}

type TreeProps = {
  itemHeight: number,
  indent: number,
  collapseIconWidth: number,
  className: string,
  root?: ?Node,
  renderNode: (node: Node, props: Object) => ReactElement,
  dispatch: ?(event: any, path: Array<string | number>) => ?any,
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
  getPath: () => Array<string | number> = () => [];
  render(): ReactElement {
    let {root, renderNode, dispatch} = this.props;

    return <div {...this.props}>
      {root && <TreeChildren node={root} renderNode={renderNode} expanded={true} depth={-1} dispatch={dispatch}
                             getPath={this.getPath}/>}
    </div>;
  }
}
