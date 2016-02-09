import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';

import Autocollapse from './Autocollapse';
import CollapseIcon from './CollapseIcon';
import propAssign from '../utils/propAssign';

import './Tree.sass';

export class TreeCell extends Component {
  static contextTypes = {
    itemHeight:   PropTypes.number.isRequired,
    indent:       PropTypes.number.isRequired,
    collapseIconWidth: PropTypes.number.isRequired,
  };
  render() {
    let {className, hasChildren, depth, expanded, selected, style, collapseIconProps = {}, children} = this.props;
    let {itemHeight, indent, collapseIconWidth} = this.context;
    let basePadding = collapseIconWidth - indent;

    className = classNames(className, 'mf-tree-node-cell', {selected});

    return <div {...this.props} className={className} style={propAssign(style, {
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
  shouldComponentUpdate(nextProps) {
    return nextProps.adapter.shouldUpdate(this.props.node, nextProps.node);
  }
  dispatch = (e, path = []) => {
    let {dispatch, pathKey} = this.props;
    if (dispatch) dispatch(e, [pathKey, ...path]);
  };
  render() {
    let {node, adapter, depth} = this.props;
    let {dispatch} = this;

    let className = classNames("mf-tree-node", {
      'mf-tree-node-branch': adapter.hasChildren(node),
    });

    return <div className={className}>
      {adapter.render(node, {depth, dispatch})}
      {adapter.hasChildren(node) && <TreeChildren {...this.props} dispatch={dispatch}/>}
    </div>;
  }
}

class TreeChildren extends Component {
  render() {
    let {node, adapter, depth, dispatch} = this.props;

    return <Autocollapse>
      {adapter.isExpanded(node) && adapter.mapChildren(node, (child, key) => {
        return <TreeNode key={key} pathKey={key} node={child} adapter={adapter}
                         depth={depth + 1} dispatch={dispatch}/>;
      })}
    </Autocollapse>;
  }
}

export default class Tree extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;
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
  getChildContext(): Object {
    let {itemHeight, indent, collapseIconWidth} = this.props;
    return {itemHeight, indent, collapseIconWidth};
  }
  render()/*: ReactElement<any,any,any> */ {
    let {root, adapter, dispatch} = this.props;

    return <div {...this.props}>
      {root && <TreeChildren node={root} adapter={adapter} depth={-1} dispatch={dispatch}/>}
    </div>;
  }
}
