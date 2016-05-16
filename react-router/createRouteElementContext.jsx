import React, {Component, PropTypes} from 'react'

class CreateRouteElementContainer extends Component {
  static childContextTypes = {
    createRouteElement: PropTypes.func.isRequired
  };
  static propTypes = {
    createElement: PropTypes.func,
    Component: PropTypes.any.isRequired,
    routerProps: PropTypes.object.isRequired
  };
  static defaultProps = {
    createElement: React.createElement
  };
  getChildContext() {
    return {
      createRouteElement: this.props.createElement
    }
  }
  render() {
    const {createElement, Component, routerProps} = this.props
    return createElement(Component, routerProps)
  }
}

export default {
  renderContainer: (Component, props) => (
    <CreateRouteElementContainer Component={Component} routerProps={props} />
  )
}
