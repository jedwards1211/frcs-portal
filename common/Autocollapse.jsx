import React, {Component, Children} from 'react';

import Collapse from '../bootstrap/Collapse';

function anyChildren(children) {
  const childArray = Children.toArray(children);
  return !!(childArray && childArray.find(c => c != null));
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
  componentWillMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  componentDidUpdate() {
    let hasChildren = anyChildren(this.props.children);
    if (this.state.open !== hasChildren) {
      setTimeout(() => {
        if (this.mounted) {
          this.setState({open: hasChildren});
        }
      }, 0);
    }
  }
  onTransitionEnd = () => {
    if (!anyChildren(this.props.children) && this.state.children !== undefined) {
      this.setState({children: undefined});
    }
    this.props.onTransitionEnd && this.props.onTransitionEnd();
  };
  render() {
    let {open, children} = this.state;
    return <Collapse {...this.props} open={open} onTransitionEnd={this.onTransitionEnd}>
      {children}
    </Collapse>;
  }
}
