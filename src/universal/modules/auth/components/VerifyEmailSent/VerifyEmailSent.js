import React, {Component} from 'react'
import styles from './VerifyEmailSent.css'
import {Link} from 'react-router'

export default class VerifyEmailSent extends Component {
  render() {
    return (
      <div className={styles.verifyEmailForm}>
        <h3 style={{textAlign: 'center'}}>Verification Email Sent</h3>
        <p className={styles.instructions}>
          A verification e-mail has been sent.  Please check your inbox for directions on verifying your password.
        </p>
        <p className={styles.instructions}>
          Can't find the e-mail? <Link to="/resend-verify-email">Resend verification e-mail</Link>
        </p>
      </div>
    )
  }
}
