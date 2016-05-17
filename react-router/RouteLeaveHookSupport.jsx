/* @flow */

import React, {Component, PropTypes} from 'react'

import type {LeaveHook} from '../flowtypes/LeaveHook'

type Props = {
  route: Object,
  children: any
};

export default class RouteLeaveHookSupport extends Component<void, Props, void> {
  mounted: boolean = false;
  leaveHooks: LeaveHook[] = [];
  static contextTypes = {
    router: PropTypes.object.isRequired,
    addLeaveHook: PropTypes.func,
    removeLeaveHook: PropTypes.func
  };
  static childContextTypes = {
    addLeaveHook: PropTypes.func.isRequired,
    removeLeaveHook: PropTypes.func.isRequired
  };
  getChildContext(): Object {
    let {addLeaveHook, removeLeaveHook} = this
    return {addLeaveHook, removeLeaveHook}
  }
  addLeaveHook: (hook: LeaveHook) => any = hook => {
    this.leaveHooks.push(hook)
  };
  removeLeaveHook: (hook: LeaveHook) => any = hook => {
    this.leaveHooks.splice(this.leaveHooks.indexOf(hook), 1)
  };
  componentDidMount(): void {
    this.mounted = true
    let {router, addLeaveHook} = this.context
    router.setRouteLeaveHook(this.props.route, this.routerWillLeave)
    addLeaveHook && addLeaveHook(this.ancestorWillLeave)
  }
  componentWillReceiveProps(nextProps: Props): void {
    let {router} = this.context
    if (nextProps.route !== this.props.route) {
      router.setRouteLeaveHook(nextProps.route, this.routerWillLeave)
    }
  }
  componentWillUnmount(): void {
    this.mounted = false
    let {removeLeaveHook} = this.context
    removeLeaveHook && removeLeaveHook(this.ancestorWillLeave)
  }
  routerWillLeave: (nextLocation: string) => ?boolean = nextLocation => {
    let result

    const leave = () => {
      result === false && this.mounted && this.context.router.push(nextLocation)
    }

    return result = this.ancestorWillLeave(leave)
  };
  ancestorWillLeave: (leave: Function) => ?boolean = leave => {
    for (let leaveHook of this.leaveHooks) {
      if (leaveHook(leave) === false) {
        return false
      }
    }
  };
  render(): React.Element {
    let {children, ...props} = this.props
    return React.cloneElement(children, props)
  }
}

export const useRouteLeaveHookSupport: () => Object = () => ({
  renderContainer: (Component, props) => (
    <RouteLeaveHookSupport route={props.route}>
      <Component {...props} />
    </RouteLeaveHookSupport>
  )
})
