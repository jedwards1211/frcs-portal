import React, {Component, Children} from 'react';

import Collapse from '../bootstrap/Collapse';

function anyChildren(children) {
  return !!Children.toArray(children).length;
}

/**
 * A Collapse that opens automatically when children are added and closes automatically when all children are removed
 */
export default class Autocollapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open:     anyChildren(props.children),
      children: props.children,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children && anyChildren(nextProps.children)) {
      this.setState({
        children: nextProps.children,
      });
    }
  }
  componentDidUpdate() {
    let hasChildren = anyChildren(this.props.children);
    setTimeout(() => this.setState({open: hasChildren}), 0);
  }
  onTransitionEnd = () => {
    if (!anyChildren(this.props.children)) {
      this.setState({children: undefined});
    }
    this.props.onTransitionEnd && this.props.onTransitionEnd();
  }
  render() {
    let {open, children} = this.state;
    return <Collapse {...this.props} open={open} onTransitionEnd={this.onTransitionEnd}>
      {children}
    </Collapse>;
  }
}
