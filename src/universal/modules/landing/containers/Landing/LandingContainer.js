import React, {PropTypes, Component} from 'react'
import Landing from 'universal/modules/landing/components/Landing/Landing'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'

@connect(mapStateToProps)
export default class LandingContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <Landing {...this.props} />
  }
}

function mapStateToProps(state) {
  return {
    showMenu: Boolean(ensureState(state).getIn(['landing', 'showMenu'])),
    isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated'])
  }
}
