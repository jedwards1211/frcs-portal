/* @flow */

import React, {Component, PropTypes, Children} from 'react'
import classNames from 'classnames'

import Autocollapse from './Autocollapse'
import CollapseIcon from './CollapseIcon'

import './Tree.sass'

type CellProps = {
  className?: string,
  children?: any,
  depth?: number,
  className?: string,
  hasChildren?: boolean,
  children?: any,
  expanded?: boolean,
  style?: Object,
  collapseIconProps?: Object
};

export class Cell extends Component<void, CellProps, void> {
  static contextTypes = {
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired
  };
  render(): React.Element {
    let {className, children, depth, hasChildren,
      expanded, style, collapseIconProps} = this.props

    depth = depth || 0

    collapseIconProps = collapseIconProps || {}

    let {itemHeight, indent, collapseIconWidth} = this.context
    let basePadding = collapseIconWidth - indent

    className = classNames(className, 'mf-tree-node-cell')

    style = Object.assign({}, style, {
      paddingLeft: basePadding + depth * indent,
      height: itemHeight,
      lineHeight: itemHeight + 'px'
    })

    let collapseIconStyle = Object.assign({}, collapseIconProps.style, {
      paddingLeft: basePadding,
      marginLeft: -basePadding,
      height: itemHeight,
      lineHeight: itemHeight + 'px',
      width: collapseIconWidth
    })

    return <div {...this.props} className={className} style={style}>
      {hasChildren && <CollapseIcon {...collapseIconProps} open={expanded} style={collapseIconStyle} />}{children}
    </div>
  }
}

type NodeProps = {
  cell?: any,
  content?: any,
  depth?: number,
  className?: string,
  hasChildren?: boolean,
  children?: any,
  expanded?: boolean,
  active?: boolean,
  collapseIconProps?: Object,
};

export class Node extends Component<void, NodeProps, void> {
  render(): React.Element {
    let {cell, content, depth, className, hasChildren, children,
        expanded, active, collapseIconProps} = this.props

    depth = depth || 0

    if (!cell) {
      cell = <Cell depth={depth} hasChildren={hasChildren} expanded={expanded}
          active={active} collapseIconProps={collapseIconProps}
             >
        {content}
      </Cell>
    }
    else {
      // note: the ordering here allows cell.props to override values from this.props
      cell = React.cloneElement(cell, Object.assign({
        depth, hasChildren, expanded, active, collapseIconProps
      }, cell.props))
    }

    className = classNames("mf-tree-node", {'mf-tree-node-branch': hasChildren, active})

    let childDepth = depth + 1

    return <div {...this.props} className={className}>
      {cell}
      {hasChildren && <Autocollapse>
        {expanded && Children.map(children, (child, key) => React.cloneElement(child, {depth: childDepth}))}
      </Autocollapse>}
    </div>
  }
}

type Props = {
  itemHeight: number,
  indent: number,
  collapseIconWidth: number,
  className?: string,
  children?: any,
};
type DefaultProps = {
  itemHeight: number,
  indent: number,
  collapseIconWidth: number,
};

export default class Tree extends Component<DefaultProps, Props, void> {
  static contextTypes = {
    TreeClass: PropTypes.string
  };
  static defaultProps = {
    itemHeight:  35,
    indent:      20,
    collapseIconWidth: 30
  };
  static childContextTypes = {
    itemHeight:         PropTypes.number.isRequired,
    indent:             PropTypes.number.isRequired,
    collapseIconWidth:  PropTypes.number.isRequired
  };
  getChildContext(): Object {
    let {itemHeight, indent, collapseIconWidth} = this.props
    return {itemHeight, indent, collapseIconWidth}
  }
  render(): React.Element {
    let {className} = this.props
    let {TreeClass} = this.context
    className = classNames(className, 'mf-tree', TreeClass || 'mf-tree-default')
    return <div {...this.props} className={className} />
  }
}
