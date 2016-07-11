import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import {changePasswordSchema} from '../../schemas/auth'

@connect(mapStateToProps)
@meatierForm({form: 'changePasswordForm', fields: ['oldPassword', 'newPassword', 'confirmPassword'], schema: changePasswordSchema})
export default class ChangePasswordContainer extends Component {
  static propTypes = {
    location: PropTypes.object,
    isAuthenticating: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
    changePasswordError: PropTypes.shape({
      _error: PropTypes.string,
    }),
    isLogin: PropTypes.bool
  };

  render() {
    const {isLogin} = this.props
    return <ChangePassword isLogin={isLogin} {...this.props} />
  }
}

function mapStateToProps(state) {
  state = ensureState(state)
  const auth = state.get('auth')
  return {
    submitting: auth.get('isChangingPassword'),
    changePasswordError: auth.get('changePasswordError').toJS()
  }
}
