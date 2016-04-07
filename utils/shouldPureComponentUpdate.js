/* @flow */

import shallowEqual from 'fbjs/lib/shallowEqual';

export default function shouldPureComponentUpdate(props: mixed, state?: mixed, context?: mixed): boolean {
  return !shallowEqual(this.props, props) ||
         !shallowEqual(this.state, state) ||
         !shallowEqual(this.context, context);
}
