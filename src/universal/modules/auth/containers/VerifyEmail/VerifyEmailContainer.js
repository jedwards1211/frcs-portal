import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import {verifyEmail} from '../../ducks/auth'
import VerifyEmail from '../../components/VerifyEmail/VerifyEmail'

@connect(mapStateToProps)
export default class VerifyEmailContainer extends Component {
  static propTypes = {
    error: PropTypes.any,
    isVerified: PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.verifyHandler(props)
  }
  componentWillReceiveProps(nextProps) {
    this.verifyHandler(nextProps)
  }
  render() {
    return <VerifyEmail {...this.props} />
  }

  verifyHandler(props) {
    /* A race between logging in & verifying exists
     It's possible that the logging in process can pull the user doc when isVerified is false
     Then, the verifyEmail can change that to be true in the DB and in the local state
     Then, log in success can turn it back to false in the local state
     Since we can guarantee we'll start authenticating before verifying, we can delay the verification*/
    const {dispatch, params: {verifiedEmailToken}, isAuthenticating, error, isVerified} = props
    if (!isVerified && !isAuthenticating && !error.size) {
      dispatch(verifyEmail(verifiedEmailToken))
      // if they don't have a JWT, we don't log them in
      // edge case since that means they logged out before they verified
    }
  }
}

function mapStateToProps(state) {
  const auth = ensureState(state).get('auth')
  return {
    error: auth.get('verifyEmailError').toJS(),
    isAuthenticating: auth.get('isAuthenticating'),
    isVerified: auth.getIn(['user', 'strategies', 'local', 'isVerified'])
  }
}
