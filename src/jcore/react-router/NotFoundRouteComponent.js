/* @flow */

import React, {Component} from 'react'
import Alert from '../bootstrap/Alert'

type Props = {
  location: {
    pathname: string
  }
};

export default class NotFoundRouteComponent extends Component<void, Props, void> {
  render(): React.Element {
    let {location: {pathname}} = this.props
    return <Alert error>Route not found: {pathname}</Alert>
  }
}
