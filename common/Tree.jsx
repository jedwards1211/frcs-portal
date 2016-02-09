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
    let {className, hasChildren, depth, expanded, selected, style, collapseIconProps, children} = this.props;
    collapseIconProps = collapseIconProps || {};
    let {itemHeight, indent, collapseIconWidth} = this.context;
    let basePadding = collapseIconWidth - indent;

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

class TreeNode extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.adapter.shouldUpdate(this.props.node, nextProps.node);
  }
  dispatch = (e, path = []) => {
    let {dispatch, pathKey} = this.props;
    if (dispatch) dispatch(e, [pathKey, ...path]);
  };
  getPath = () => {
    let {getPath, pathKey} = this.props;
    return [...getPath(), pathKey];
  };
  render() {
    let {node, adapter, depth} = this.props;
    let {dispatch} = this;

    let className = classNames("mf-tree-node", {
      'mf-tree-node-branch': adapter.hasChildren(node),
    });

    return <div className={className}>
      {adapter.render(node, {depth, dispatch, getPath: this.getPath})}
      {adapter.hasChildren(node) && <TreeChildren {...this.props} getPath={this.getPath} dispatch={dispatch}/>}
    </div>;
  }
}

class TreeChildren extends Component {
  render() {
    let {node, isRoot, adapter, depth, dispatch, getPath} = this.props;

    return <Autocollapse>
      {(isRoot || adapter.isExpanded(node)) && adapter.mapChildren(node, (child, key) => {
        return <TreeNode key={key} pathKey={key} node={child} adapter={adapter}
                         depth={depth + 1} dispatch={dispatch} getPath={getPath}/>;
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
  getChildContext() {
    let {itemHeight, indent, collapseIconWidth} = this.props;
    return {itemHeight, indent, collapseIconWidth};
  }
  getPath = () => [];
  render() {
    let {root, adapter, dispatch} = this.props;

    return <div {...this.props}>
      {root && <TreeChildren node={root} isRoot={true} adapter={adapter} depth={-1} dispatch={dispatch}
                             getPath={this.getPath}/>}
    </div>;
  }
}
