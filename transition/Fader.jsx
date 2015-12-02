import React, {Component, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';

import ObservableTransitionGroup from '../transition/ObservableTransitionGroup';

import './Fader.sass';

class ChildWrapper extends Component {
  render() {
    let {className, isIn, isEntering, isLeaving, children} = this.props; 
    className = classNames(className, 'mf-fader-child', {
      'in': isIn, 
      entering: isEntering,
      leaving: isLeaving,
    });
    return cloneElement(Children.only(children), {className});
  }
}

export default class Fader extends Component {
  constructor(props) {
    super(props);
    this.state = {height: 0};
  }
  wrapChild = child => {
    return <ChildWrapper ref={child.key}>{child}</ChildWrapper>;
  }
  updateHeight = () => {
    let height = 0;
    let children = findDOMNode(this.refs.root).querySelectorAll('.mf-fader-child');
    for (let i = 0; i < children.length; i++) {
      height = Math.max(height, children[i].scrollHeight || 0);
    }
    if (height !== this.state.height) {
      this.setState({height});
    }
  }
  componentDidMount = this.updateHeight
  componentDidUpdate = this.updateHeight
  render() {
    let {className, children} = this.props;
    let {height} = this.state;

    let transitioning = Children.toArray(children).length > 1;
    className = classNames(className, 'mf-fader', {transitioning});

    return <ObservableTransitionGroup ref="root" {...this.props} className={className} 
            component="div" style={transitioning ? {height} : {}} childFactory={this.wrapChild}/>;
  }
}
