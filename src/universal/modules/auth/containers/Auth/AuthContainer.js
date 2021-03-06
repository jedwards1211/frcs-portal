import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import Auth from '../../components/Auth/Auth'
import {ensureState} from 'redux-optimistic-ui'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import validateFields from 'universal/utils/validateFields'
import validateUsername from 'universal/utils/validateUsername'
import validatePassword from 'universal/utils/validatePassword'
import validateEmail from 'universal/utils/validateEmail'
import required from 'universal/utils/required'

const SignUpContainer = meatierForm({
  form: 'signup',
  fields: ['username', 'email', 'password', 'confirmPassword'],
  validate: validateFields({
    username: [required, validateUsername],
    email: [required, validateEmail],
    password: [required, validatePassword],
    confirmPassword: [required, (confirmPassword, {password}) => {
      if (confirmPassword !== password) return {valid: false, error: 'Passwords do not match'}
      return {valid: true}
    }]
  })
})(Auth)
const LoginContainer = meatierForm({
  form: 'login',
  fields: ['email', 'password'],
  validate: validateFields({
    email: required,
    password: required
  })
})(Auth)

// use the same form to retain form values (there's really no difference between login and signup, it's just for show)
@connect(mapStateToProps)
// must come after connect to get the path field
// @meatierForm({form: 'authForm', fields: ['email', 'password'], schema: authSchemaInsert})
export default class AuthContainer extends Component {
  static propTypes = {
    location: PropTypes.object,
    isAuthenticating: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
    authError: PropTypes.shape({
      _error: PropTypes.string,
      email: PropTypes.string,
      password: PropTypes.string
    }),
    isLogin: PropTypes.bool
  };

  render() {
    const {isLogin} = this.props
    const Container = isLogin ? LoginContainer : SignUpContainer
    return <Container isLogin={isLogin} {...this.props} />
  }
}

function mapStateToProps(state, props) {
  state = ensureState(state)
  const auth = state.get('auth')
  const {pathname} = props.location
  const isLogin = pathname && pathname.indexOf('/login') !== -1
  return {
    isAuthenticated: auth.get('isAuthenticated'),
    isAuthenticating: auth.get('isAuthenticating'),
    authError: auth.get(isLogin ? 'loginError' : 'signupError').toJS(),
    isLogin
  }
}
