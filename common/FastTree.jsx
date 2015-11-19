import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import shouldPureComponentUpdate from 'react-pure-render/function';
import classNames from 'classnames';

import CollapseIcon from './CollapseIcon';
import Autocollapse from './Autocollapse';
import propAssign from '../utils/propAssign';

import './Tree.sass';

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

    let expanded = model.get('expanded'),
        children = model.get('children');

    let hasChildren = children && !!children.size;

    return <div {...this.props} className="mf-tree-node-cell"
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
  dispatchEvent = (path, e) => {
    if (arguments.length === 1) {
      e = path;
      path = [];
    }
    this.props.dispatchEvent(['children', this.props._key, ...path], e);
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
          (child, key) => child && <Node key={key} _key={key} model={child} depth={depth + 1}
                                         dispatchEvent={this.dispatchEvent}/>).toJS()}
      </Autocollapse>
    </div>;
  }
}
export default class FastTree extends Component {
  static propTypes = {
    basePadding:      PropTypes.number,
    indent:           PropTypes.number,
    model:            nodePropType.isRequired,
    defaultRenderer:  PropTypes.any,
    dispatchEvent:    PropTypes.func,
  }
  static defaultProps = {
    basePadding:      7,
    indent:           15,
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
  render() {
    let {className, model} = this.props;

    let children = model.get('children');

    className = classNames(className, 'mf-tree');

    return <div {...this.props} className={className}>
      {children && children.map((child, key) => child && <Node key={key} _key={key} model={child}
                                                         dispatchEvent={this.props.dispatchEvent}/>).toJS()}
    </div>;
  }
}

FastTree.Node = Node;
FastTree.Cell = Cell;
