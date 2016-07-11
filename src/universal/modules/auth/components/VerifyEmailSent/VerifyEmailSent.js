import React, {Component} from 'react'
import styles from './VerifyEmailSent.css'

export default class VerifyEmailSent extends Component {
  render() {
    return (
      <div className={styles.verifyEmailForm}>
        <h3>Verification Email Sent</h3>
        <span className={styles.instructions}>
          A verification e-mail has been sent.  Please check your inbox for directions on verifying your password.
        </span>
      </div>
    )
  }
}
