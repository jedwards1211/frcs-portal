import React, {Component, PropTypes} from 'react'

import Collapse from '../bootstrap/Collapse'
import InterruptibleTransitionGroup from './InterruptibleTransitionGroup'

export class ChildWrapper extends Component {
  state = {
    isIn: false,
  };
  mounted = false;
  componentWillMount() {
    this.mounted = true
  }
  componentWillUnmount() {
    this.mounted = false
  }
  componentWillAppear(callback) {
    this.enterCallback = this.leaveCallback = undefined
    this.appearCallback = callback
    setTimeout(() => this.mounted && this.setState({
      isIn: true,
    }),  0)
  }
  componentDidAppear() {
    this.appearCallback = undefined
    this.setState({ isAppearing: false })
  }
  componentWillEnter(callback) {
    this.appearCallback = this.leaveCallback = undefined
    this.enterCallback = callback
    // we setTimeout so that the component can mount without inClassName first,
    // and then add it a moment later.  Otherwise it may not transition
    setTimeout(() => this.mounted && this.setState({
      isIn: true,
    }),  0)
  }
  componentDidEnter() {
    this.enterCallback = undefined
    this.setState({ isEntering: false })
  }
  componentWillLeave(callback) {
    this.appearCallback = this.enterCallback = undefined
    this.leaveCallback = callback
    this.setState({
      isIn: false,
    })
  }
  componentDidLeave() {
    this.leaveCallback = undefined
    this.setState({ isLeaving: false })
  }
  onTransitionEnd = () => {
    if (this.appearCallback) this.appearCallback()
    if (this.enterCallback) this.enterCallback()
    if (this.leaveCallback) this.leaveCallback()
  };
  render() {
    let {children} = this.props
    let {isIn} = this.state

    return <Collapse {...this.props} open={isIn} onTransitionEnd={this.onTransitionEnd}>{children}</Collapse>
  }
}

/**
 * An ObservableTransitionGroup that automatically collapses children in and out.
 */
export default class CollapseTransitionGroup extends Component {
  static propTypes = {
    expandOnAppear: PropTypes.bool,
    collapseProps:  PropTypes.object,
  };
  static defaultPropTypes = {
    expandOnAppear: false,
  };
  wrapChild = (child) => {
    let {collapseProps, expandOnAppear} = this.props
    return <ChildWrapper {...collapseProps} expandOnAppear={expandOnAppear} key={child.key}>{child}</ChildWrapper>
  };
  render() {
    return <InterruptibleTransitionGroup {...this.props} childFactory={this.wrapChild} />
  }
}
