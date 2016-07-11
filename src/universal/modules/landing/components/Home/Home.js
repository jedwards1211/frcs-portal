import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import RaisedButton from 'material-ui/RaisedButton'
import {push} from 'react-router-redux'
import styles from './Home.css'

export default class Home extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    user: PropTypes.object,
    dispatch: PropTypes.func,
  };
  render() {
    const {isAuthenticated, user, dispatch} = this.props

    if (isAuthenticated && user) {
      const displayName = user.get('firstName') || user.get('username')
      const isVerified = user.getIn(['strategies', 'local', 'isVerified'])

      return (
        <div className={styles.home}>
          <h3 className={styles.header}>Welcome, {displayName}!</h3>
          {isVerified ||
            <div>
              <p>Note: you have not verified your e-mail address yet.</p>
              <p>You must verify your e-mail to be able to use OwnCloud, Subversion, or other services.</p>
              <p>To verify your e-mail, click on the link in the verification e-mail you received when you signed up.
              Can't find the e-mail?  <Link to="/resend-verify-email">Request a new verification e-mail</Link></p>
            </div>
          }
        </div>
      )
    }
    
    return (
      <div className={styles.home}>
        <h3 className={styles.header}>Welcome to our member portal!</h3>
        <div className={styles.login}>
          <RaisedButton className={styles.button} secondary label="Sign Up" onTouchTap={() => dispatch(push('/signup'))} />
          <RaisedButton className={styles.button} primary label="Log In" onTouchTap={() => dispatch(push('/login'))} />
        </div>
      </div>
    )
  }
}
