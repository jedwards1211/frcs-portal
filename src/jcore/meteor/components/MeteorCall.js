/* @flow */

import React, {Component} from 'react'
import shallowEqual from 'fbjs/lib/shallowEqual'

import Alert from '../../bootstrap/Alert'
import Spinner from '../../common/Spinner'

import {createSkinDecorator} from 'react-skin'

type Props = {
  inject?: boolean,
  banner?: boolean,
  viewSkin?: boolean,
  callingMessage?: any,
  errorMessage?: any,
  method: string,
  args?: any[],
  children?: any,
}

type State = {
  callNumber: number,
  calling: boolean,
  error?: Error,
  result?: any,
}

const Banner: (props: Props & State) => ?React.Element = props => {
  let {calling, error, callingMessage, errorMessage} = props

  if (calling) {
    return <Alert info><Spinner /> {callingMessage}</Alert>
  }
  if (error) {
    return <Alert error={error}>{errorMessage}</Alert>
  }
  return <span />
}

const ViewSkin = createSkinDecorator({
  Body: (Body, props, decorator) => {
    let {calling, error} = decorator.props
    return <Body {...props}>
    {Banner(decorator.props)}
    {!calling && !error && props.children}
    </Body>
  },
  Footer: (Footer, props, decorator) => {
    let {calling, error} = decorator.props
    return <Footer {...props}>
      {!calling && !error && props.children}
    </Footer>
  }
})


/**
 * Will call Meteor.call with the method and args declared.  Anytime they change, it will make a new call.  Keeps track
 * of whether it's calling, and if the most recent call is finished, its error or return value.  These may be rendered
 * as a standalone `banner`, a `viewSkin` that injects a banner into its children, or custom `inject`ion passed to your
 * own `children` rendering function.
 */
export default class MeteorCall extends Component<void, Props, State> {
  state: State = {
    callNumber: 0,
    calling: true
  };

  mounted: boolean = false;

  componentWillMount() {
    this.mounted = true
    this.callMeteor()
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.method !== this.props.method ||
        !shallowEqual(nextProps.args, this.props.args)) {
      this.callMeteor(nextProps)
    }
  }

  callMeteor: (props?: Props) => void = (props = this.props) => {
    const {method, args} = this.props
    let callNumber = this.state.callNumber + 1
    this.setState({
      calling: true,
      error: undefined,
      result: undefined,
      callNumber,
    }, () => {
      Meteor.call(method, ...args || [], (error, result) => {
        if (!this.mounted || this.state.callNumber !== callNumber) return
        this.setState({
          calling: false,
          error,
          result
        })
      })
    })
  };

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const {children, inject, banner, viewSkin} = this.props
    const {calling, error, result} = this.state

    if (inject) {
      if (children instanceof Function) return children({calling, error, result})
    }
    else if (banner) {
      return Banner({...this.props, ...this.state})
    }
    else if (viewSkin) {
      return <ViewSkin {...this.props} {...this.state}>
        {children}
      </ViewSkin>
    }

    return null
  }
}
