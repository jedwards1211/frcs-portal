import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import CircularProgress from 'material-ui/CircularProgress'
import {resendVerifyEmail} from '../../ducks/auth'

@connect(mapStateToProps)
export default class ResendVerifyEmail extends Component {
  static propTypes = {
    error: PropTypes.any,
    resending: PropTypes.bool,
    dispatch: PropTypes.func
  }
  componentWillMount() {
    this.props.dispatch(resendVerifyEmail())
  }
  render() {
    const {error, resending} = this.props 
    
    if (resending) {
      return (
        <h3 style={{textAlign: 'center', verticalAlign: 'middle'}}>
          <CircularProgress /> Sending verification email...
        </h3>
      )
    }
    
    if (error) {
      return (
        <h3 style={{textAlign: 'center'}}>
          Failed to send verification email: {error._error} 
        </h3>
      )
    }
    
    return null
  }
}

function mapStateToProps(state, props) {
  state = ensureState(state)
  const auth = state.get('auth')
  return {
    resending: auth.get('isResendingVerifyEmail'),
    error: auth.get('resendVerifyEmailError').toJS() 
  }
}
