import React, {Component, PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import styles from './Auth.css'
import {Link} from 'react-router'
import {loginUser, signupUser, oauthLogin} from '../../ducks/auth'

export default class Auth extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    error: PropTypes.any,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    params: PropTypes.shape({
      resetToken: PropTypes.string
    }),
    location: PropTypes.shape({
      query: PropTypes.shape({
        e: PropTypes.string,
        next: PropTypes.string
      })
    }),
    isAuthenticating: PropTypes.bool,
    isLogin: PropTypes.bool,
    authError: PropTypes.shape({
      _error: PropTypes.string,
      username: PropTypes.string,
      email: PropTypes.string,
      password: PropTypes.string
    }),
    dispatch: PropTypes.func.isRequired
  }

  render() {
    const {fields: {username, email, password, confirmPassword}, handleSubmit, isLogin, error, isAuthenticating, authError} = this.props
    const localError = error || authError._error
    /* eslint-disable react/jsx-handler-names*/
    return (
      <div className={styles.loginForm}>
        <h3>{isLogin ? 'Login' : 'Sign up'}</h3>
        {localError && <span>{localError}</span>}
        <form className={styles.loginForm} onSubmit={handleSubmit(this.onSubmit)}>
          {!isLogin &&
            <TextField
                {...username}
                type="text"
                hintText="jdoe"
                errorText={username && username.touched && username.error || ''}
                floatingLabelText="Username"
            />
          }

          <TextField
              {...email}
              type="text"
              hintText="name@email.com"
              errorText={email.touched && email.error || ''}
              floatingLabelText={isLogin ? "Username or E-mail Address" : "Email"}
          />

          <TextField
              {...password}
              type="password"
              floatingLabelText="Password"
              hintText={"oQyX9\"WXaE9"}
              errorText={password.touched && password.error || ''}
          />

          {!isLogin &&
            <TextField
              {...confirmPassword}
              type="password"
              floatingLabelText="Confirm password"
              hintText={"oQyX9\"WXaE9"}
              errorText={confirmPassword.touched && confirmPassword.error || ''}
            />
          }

          {isLogin && (
            <Link to={{pathname: '/login/lost-password', query: {e: email.value}}} className={styles.lostPassword}>
              Forgot your password?
            </Link>
          )}

          <div className={styles.loginButton}>
            <RaisedButton
                label={isLogin ? 'Login' : 'Sign up'}
                secondary
                type="submit"
                disabled={isAuthenticating}
                onClick={handleSubmit(this.onSubmit)}
            />
          </div>
          
          {isLogin && (
            <div className={styles.notRegistered}>
              Not registered? <Link to={{pathname: '/signup'}}>Sign Up</Link>
            </div>  
          )}
          {!isLogin && (
            <div className={styles.alreadyRegistered}>
              Already registered? <Link to={{pathname: '/login'}}>Log In</Link>
            </div>  
          )}
        </form>
      </div>
    )
  }
  // need async?
  loginWithGoogle = () => {
    const redirectRoute = this.props.location.query.next || '/'
    this.props.dispatch(oauthLogin('/auth/google', redirectRoute))
  };

  onSubmit = (data, dispatch) => {
    const {isLogin} = this.props
    const newData = {...data}
    if (isLogin) {
      newData.usernameOrEmail = newData.email
    }
    // gotta get that redirect from props
    const redirectRoute = this.props.location.query.next || '/'
    const authFunc = isLogin ? loginUser : signupUser
    return authFunc(dispatch, newData, redirectRoute)
  };
}
