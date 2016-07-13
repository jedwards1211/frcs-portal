import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import ChangeEmail from '../../components/ChangeEmail/ChangeEmail'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import {changeEmailSchema} from '../../schemas/auth'

@connect(mapStateToProps)
@meatierForm({form: 'changeEmailForm', fields: ['password', 'newEmail'], schema: changeEmailSchema})
export default class ChangeEmailContainer extends Component {
  static propTypes = {
    location: PropTypes.object,
    isAuthenticating: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
    changeEmailError: PropTypes.shape({
      _error: PropTypes.string,
    }),
  };

  render() {
    return <ChangeEmail {...this.props} />
  }
}

function mapStateToProps(state) {
  state = ensureState(state)
  const auth = state.get('auth')
  return {
    submitting: auth.get('isChangingEmail'),
    changeEmailError: auth.get('changeEmailError').toJS()
  }
}
