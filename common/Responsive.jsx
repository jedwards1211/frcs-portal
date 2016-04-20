/* @flow */

import React, {Component} from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';
import _ from 'lodash';

type Props = {
  domProps?: string[],
  computedStyleProps?: string[],
  children: (state: {computedStyle?: Object, [domProp: string]: any}) => ?React.Element,
  component: string
};

type DefaultProps = {
  component: string
};

type State = Object;

export default class Responsive extends Component<DefaultProps,Props,State> {
  static defaultProps = {
    component: 'div'
  };
  state: State = {
    remeasure: this.remeasure
  }; 
  mounted: boolean = false;
  root: ?Object;
  componentWillMount() {
    this.mounted = true;
  }
  componentDidMount() {
    this.remeasure();
    window.addEventListener('resize', this.remeasure);
  }
  componentWillReceiveProps(nextProps: Props) {
    if (!shallowEqual(this.props.domProps, nextProps.domProps) || 
        !shallowEqual(this.props.computedStyleProps, nextProps.computedStyleProps)) {
      this.remeasure();
    }
  }
  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.remeasure);
  }
  remeasure: Function = _.throttle(() => {
    const {root} = this;
    if (this.mounted && root) {
      let {domProps, computedStyleProps} = this.props;
      let nextState = {};
      if (domProps) {
        domProps.forEach(prop => nextState[prop] = root[prop]);
      }
      if (computedStyleProps) {
        nextState.computedStyle = {};
        let computedStyle = getComputedStyle(root);
        computedStyleProps.forEach(prop => nextState.computedStyle[prop] = computedStyle[prop]);
      }
      this.setState(nextState);
    } 
  }, 500);
  render(): ?React.Element {
    let {props: {children}, state} = this;
    let Comp: any = this.props.component;
    return <Comp ref={c => this.root= c} children={children(state)}/>;
  }
}
