import React, {PropTypes, Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import LinearProgress from 'material-ui/LinearProgress'
import styles from './ChangePassword.css'
import {changePassword} from '../../ducks/auth'
import validatePassword from 'universal/utils/validatePassword'

export default class ChangePassword extends Component {
  static propTypes = {
    fields: PropTypes.any,
    error: PropTypes.any,
    changePasswordError: PropTypes.shape({
      _error: PropTypes.string
    }),
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    params: PropTypes.shape({
      changeToken: PropTypes.string
    })
  }
  render() {
    const {fields: {oldPassword, newPassword, confirmPassword}, error,
      changePasswordError, handleSubmit, submitting} = this.props

    const passval = newPassword && newPassword.value && validatePassword(newPassword.value)

    const localError = error || (changePasswordError && changePasswordError._error)
    return (
      <div className={styles.changePasswordForm}>
        <h3>Change your password</h3>
        {localError && !submitting && <span>{localError}</span>}
        <form className={styles.changePasswordForm} onSubmit={handleSubmit(this.onSubmit)}>
          {submitting && <LinearProgress />}
          <TextField
              {...oldPassword}
              type="password"
              floatingLabelText="Old Password"
              hintText={"oQyX9\"WXaE9"}
              errorText={oldPassword.touched && oldPassword.error || ''}
          />

          <TextField
              {...newPassword}
              type="password"
              floatingLabelText="New Password"
              hintText={"oQyX9\"WXaE9"}
              errorText={(passval && passval.error) || (newPassword.touched && newPassword.error || '')}
          />
          <TextField
              {...confirmPassword}
              type="password"
              floatingLabelText="Confirm Passsword"
              hintText={"oQyX9\"WXaE9"}
              errorText={confirmPassword.touched && confirmPassword.error || ''}
          />

          <div className={styles.changePasswordButton}>
            <RaisedButton
                label={submitting ? 'Changing password...' : 'Set new password'}
                secondary
                type="submit"
                disabled={submitting}
                onClick={handleSubmit(this.onSubmit)}
            />
          </div>
        </form>
      </div>
    )
  }
  onSubmit = (data, dispatch) => {
    return changePassword(data, dispatch)
  };
}
