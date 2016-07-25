import React, {PropTypes, Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import LinearProgress from 'material-ui/LinearProgress'
import styles from './ResetPassword.css'
import meatierForm from 'universal/decorators/meatierForm/meatierForm'
import {resetPassword} from '../../ducks/auth'
import validateFields from 'universal/utils/validateFields'
import validatePassword from 'universal/utils/validatePassword'
import required from 'universal/utils/required'

@meatierForm({
  form: 'resetPasswordForm',
  fields: ['password', 'confirmPassword'],
  validate: validateFields({
    password: [required, validatePassword],
    confirmPassword: [required, (confirmPassword, {password}) => {
      if (confirmPassword !== password) return {valid: false, error: 'Passwords do not match'}
      return {valid: true}
    }]
  })
})
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

    const passval = password && password.value && validatePassword(password.value)

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
              errorText={(passval && passval.error) || (password.touched && password.error || '')}
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
