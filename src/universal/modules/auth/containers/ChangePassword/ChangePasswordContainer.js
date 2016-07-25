import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {ensureState} from 'redux-optimistic-ui'
import ChangePassword from '../../components/ChangePassword/ChangePassword'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import validateFields from 'universal/utils/validateFields'
import validatePassword from 'universal/utils/validatePassword'
import required from 'universal/utils/required'

@connect(mapStateToProps)
@meatierForm({
  form: 'changePasswordForm',
  fields: ['oldPassword', 'newPassword', 'confirmPassword'],
  validate: validateFields({
    oldPassword: required,
    newPassword: [required, validatePassword],
    confirmPassword: [required, (confirmPassword, {newPassword}) => {
      if (confirmPassword !== newPassword) return {valid: false, error: 'Passwords do not match'}
      return {valid: true}
    }]
  })
})
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
