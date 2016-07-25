import React, {PropTypes, Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import LinearProgress from 'material-ui/LinearProgress'
import styles from './ResetPassword.css'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import {passwordAuthSchema} from '../../schemas/auth'
import {resetPassword} from '../../ducks/auth'

@meatierForm({form: 'resetPasswordForm', fields: ['password', 'confirmPassword'], schema: passwordAuthSchema})
export default class ResetPassword extends Component {
  static propTypes = {
    fields: PropTypes.any,
    error: PropTypes.any,
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    params: PropTypes.shape({
      resetToken: PropTypes.string
    })
  }
  render() {
    const {fields: {password, confirmPassword}, error, handleSubmit, submitting} = this.props
    return (
      <div className={styles.resetPasswordForm}>
        <h3>Reset your password</h3>
        <span className={styles.instructions}>Please type your new password here</span>
        {error && !submitting && <span>{error}</span>}
        <form className={styles.resetPasswordForm} onSubmit={handleSubmit(this.onSubmit)}>
          {submitting && <LinearProgress />}
          <TextField
              {...password}
              type="password"
              floatingLabelText="Password"
              hintText={"oQyX9\"WXaE9"}
              errorText={password.touched && password.error || ''}
          />
          <TextField
              {...confirmPassword}
              type="password"
              floatingLabelText="Confirm Passsword"
              hintText={"oQyX9\"WXaE9"}
              errorText={confirmPassword.touched && confirmPassword.error || ''}
          />
          
          <div className={styles.resetPasswordButton}>
            <RaisedButton
                label={submitting ? "Changing password..." : "Set new password"}
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
    const {resetToken} = this.props.params
    const outData = Object.assign({}, data, {resetToken})
    return resetPassword(outData, dispatch)
  };
}
