import React, {PropTypes, Component} from 'react'
import Home from 'universal/modules/landing/components/Home/Home'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'

@connect(mapStateToProps)
export default class HomeContainer extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
  };

  render() {
    return <Home {...this.props} />
  }
}

function mapStateToProps(state) {
  state = ensureState(state)
  return {
    user: state.getIn(['auth', 'user']),
    isAuthenticating: state.getIn(['auth', 'isAuthenticating']),
    isAuthenticated: state.getIn(['auth', 'isAuthenticated'])
  }
}
