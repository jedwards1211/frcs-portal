/* @flow */

import React, {Component, PropTypes} from 'react';

type Props = {
  to: any
};

export default class Redirect extends Component<void,Props,void> {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };
  componentDidMount() {
    this.context.router.push(this.props.to);
  }
  render(): ?React.Element {
    return null;
  }
}
