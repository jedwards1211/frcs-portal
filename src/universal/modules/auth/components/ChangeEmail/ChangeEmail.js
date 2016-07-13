import React, {PropTypes, Component} from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import styles from './ChangeEmail.css'
import {changeEmail} from '../../ducks/auth'

export default class ChangeEmail extends Component {
  static propTypes = {
    fields: PropTypes.any,
    error: PropTypes.any,
    changeEmailError: PropTypes.shape({
      _error: PropTypes.string
    }),
    handleSubmit: PropTypes.func,
    submitting: PropTypes.bool,
    params: PropTypes.shape({
      changeToken: PropTypes.string
    })
  }
  render() {
    const {fields: {password, newEmail}, error,
      changeEmailError, handleSubmit, submitting} = this.props
    
    const localError = error || (changeEmailError && changeEmailError._error)
    return (
      <div className={styles.changeEmailForm}>
        <h3>Change your email</h3>
        {localError && <span>{localError}</span>}
        <form className={styles.changeEmailForm} onSubmit={handleSubmit(this.onSubmit)}>
          <TextField
              {...password}
              type="password"
              floatingLabelText="Password"
              hintText={"oQyX9\"WXaE9"}
              errorText={password.touched && password.error || ''}
          />
 
          <TextField
              {...newEmail}
              type="email"
              floatingLabelText="New Email"
              hintText={"jim@jimbob.com"}
              errorText={newEmail.touched && newEmail.error || ''}
          />

          <div className={styles.changeEmailButton}>
            <RaisedButton
                label={submitting ? 'Changing email' : 'Set new email'}
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
    return changeEmail(data, dispatch)
  };
}
