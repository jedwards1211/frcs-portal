import React, {PropTypes, Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import LinearProgress from 'material-ui/LinearProgress'
import styles from './LostPassword.css'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import {emailPasswordReset} from '../../ducks/auth'
import validateFields from 'universal/utils/validateFields'
import required from 'universal/utils/required'

@meatierForm({
  form: 'lostPasswordForm',
  fields: ['email'],
  validate: validateFields({
    email: required
  })
})
export default class LostPassword extends Component {
  static propTypes = {
    fields: PropTypes.object,
    error: PropTypes.any,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    params: PropTypes.shape({
      resetToken: PropTypes.string
    }),
    location: PropTypes.shape({
      query: PropTypes.shape({
        e: PropTypes.string
      })
    })
  }
  render() {
    const {fields: {email}, error, handleSubmit, submitting, location} = this.props
    return (
      <div className={styles.lostPasswordForm}>
        <h3>Lost password</h3>
        <span className={styles.instructions}>Enter your email address and we'll send you a password reset link.</span>
        {error && !submitting && <span>{error}</span>}
        <form className={styles.lostPasswordForm} onSubmit={handleSubmit(emailPasswordReset)}>
          {submitting && <LinearProgress />}
          <input style={{display: 'none'}} type="text" name="javascript-disabled" />

          <TextField
              {...email}
              type="text"
              hintText="name@email.com"
              errorText={email.touched && email.error || ''}
              floatingLabelText="Email"
              defaultValue={location.query.e}
              autoFocus
          />
          <input style={{display: 'none'}} type="text" name="javascript-disabled" />
          <div className={styles.lostPasswordButton}>
            <RaisedButton
                label={submitting ? "Sending..." : "Send password reset"}
                secondary
                type="submit"
                disabled={submitting}
                onClick={handleSubmit(emailPasswordReset)}
            />
          </div>
        </form>
      </div>
    )
  }
}
