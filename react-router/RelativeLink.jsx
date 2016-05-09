/* @flow */

import path from 'path';
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

type Props = {
  to?: string
};

type State = {
  location?: Object
};

export default class RelativeLink extends Component<void,Props,State> {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };
  state: State = {};
  unsubscribe: ?Function;
  componentWillMount() {
    this.unsubscribe = this.context.router.listen(this.setLocation);
  }
  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }
  setLocation: (location: Object) => void = location => this.setState({location});
  render(): React.Element {
    let {location: {pathname}} = this.state;    
    return <Link {...this.props} to={path.join(pathname, this.props.to)}/>;
  }
}
