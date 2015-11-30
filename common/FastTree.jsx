import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import classNames from 'classnames';

import smoothScroll from 'smoothscroll';

import CollapseIcon from './CollapseIcon';
import Autocollapse from './Autocollapse';
import propAssign from '../utils/propAssign';

import './Tree.sass';

import {forEachNode, expandTreePath} from './FastTreeHelpers';

export {forEachNode, expandTreePath};

const nodePropType = ImmutablePropTypes.shape({
  renderer: PropTypes.any,
  expanded: PropTypes.bool,
  children: PropTypes.instanceOf(Immutable.Iterable),
});

class Cell extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  static propTypes = {
    depth: PropTypes.number,
    model: nodePropType.isRequired,
  }
  static contextTypes = {
    basePadding:  PropTypes.number,
    indent:       PropTypes.number,
  }
  render() {
    let {model, depth, style, className} = this.props;
    let {basePadding, indent} = this.context;

    let selected = model.get('selected'),
        expanded = model.get('expanded'),
        children = model.get('children');

    className = classNames(className, 'mf-tree-node-cell', {selected, expanded});

    let hasChildren = children && !!children.size;

    return <div {...this.props} className={className}
      style={propAssign(style, {paddingLeft: basePadding + indent * depth})}>
      {hasChildren && <CollapseIcon open={expanded}/>} {model.get('value')}
    </div>;
  }
}

class Node extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  static propTypes = {
    _key:           PropTypes.any.isRequired,
    depth:          PropTypes.number,
    model:          nodePropType.isRequired,
    dispatchEvent:  PropTypes.func,
  }
  static defaultProps = {
    depth:          0,
    dispatchEvent:  function() {},
  }
  static contextTypes = {
    defaultRenderer:  PropTypes.any,
  }
  static defaultContextTypes = {
    defaultRenderer:  Cell,
  }
  dispatchEvent = (e, path = []) => {
    this.props.dispatchEvent(e, ['children', this.props._key, ...path]);
  }
  render() {
    let {className, depth, model} = this.props;
    let {defaultRenderer} = this.context;

    let Renderer = model.get('renderer') || defaultRenderer,
        selected = model.get('selected'),
        expanded = model.get('expanded'),
        children = model.get('children');

    let hasChildren = children && !!children.size;

    className = classNames(className, "mf-tree-node", {selected, 'mf-tree-node-branch': hasChildren});

    return <div {...this.props} className={className}>
      <Renderer model={model} depth={depth} dispatchEvent={this.dispatchEvent}/>
      <Autocollapse>
        {expanded && children.map(
          (child, key) => child && <Node key={key} _key={key} ref={key} model={child} depth={depth + 1}
                                         dispatchEvent={this.dispatchEvent}/>).toArray()}
      </Autocollapse>
    </div>;
  }
}
export default class FastTree extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  static propTypes = {
    basePadding:      PropTypes.number,
    indent:           PropTypes.number,
    model:            nodePropType.isRequired,
    defaultRenderer:  PropTypes.any,
    dispatchEvent:    PropTypes.func,
  }
  static defaultProps = {
    basePadding:      7,
    indent:           18,
    defaultRenderer:  Cell,
    className:        'mf-tree-default',
    dispatchEvent:    function() {},
  }
  static childContextTypes = {
    basePadding:      PropTypes.number.isRequired,
    indent:           PropTypes.number.isRequired,
    defaultRenderer:  PropTypes.any,
  }
  getChildContext() {
    let {basePadding, indent, defaultRenderer} = this.props;
    return {basePadding, indent, defaultRenderer};
  }
  scrollToPath(path, context) {
    let target = this;
    for (let i = 1; target && i < path.length; i += 2) {
      target = target.refs[path[i]];
    }
    if (target) {
      smoothScroll(findDOMNode(target), 500, function() {}, context);
    }
  }
  render() {
    let {className, model, dispatchEvent} = this.props;

    let children = model.get('children');

    className = classNames(className, 'mf-tree');

    return <div {...this.props} ref="root" className={className}>
      {children && children.map((child, key) => child && <Node key={key} _key={key} ref={key} model={child}
                                                         dispatchEvent={dispatchEvent}/>).toArray()}
    </div>;
  }
}

FastTree.Node = Node;
FastTree.Cell = Cell;
