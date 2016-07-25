import React, {PropTypes, Component} from 'react'
import styles from './VerifyEmail.css'
import LinearProgress from 'material-ui/LinearProgress'
import {Link} from 'react-router'
import RaisedButton from 'material-ui/RaisedButton'

export default class VerifyEmail extends Component {
  static propTypes = {
    error: PropTypes.any,
    isVerified: PropTypes.bool
  }

  render() {
    const {error, isVerified} = this.props
    let status
    if (error && error._error) {
      status = `There was an error verifying your email: ${error._error}`
    } else {
      status = isVerified 
        ? (
          <div className={styles.form}>
            <p>Your email has been verified. Thank you!</p>
            <RaisedButton secondary linkButton containerElement={<Link to="/" />} label="Home" />
          </div>
        )
        : (
          <div className={styles.form}>
            <p>Your email is currently being verified...</p>
            <LinearProgress />
          </div>
        )
    }

    return (
      <div className={styles.form}>
        <h3>Verifying Email</h3>
        <span className={styles.instructions}>{status}</span>
      </div>
    )
  }
}
