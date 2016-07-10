import React, {Component, PropTypes} from 'react'
import Header from '../Header/Header'

export default class Home extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    user: PropTypes.object
  };
  render() {
    const {isAuthenticated, user} = this.props

    if (isAuthenticated && user) {
      const displayName = user.get('firstName') || user.get('username')
      const isVerified = user.getIn(['strategies', 'local', 'isVerified'])

      return (
        <div style={{margin: '15px auto', maxWidth: 600}}>
          <h1>Welcome, {displayName}!</h1>
          {isVerified ||
            <div>
              <p>Note: you have not verified your e-mail address yet.</p>
              <p>You must verify your e-mail to be able to use OwnCloud, Subversion, or other services.</p>
              <p>To verify your e-mail, click on the link in the verification e-mail you received when you signed up.</p>
            </div>
          }
        </div>
      )
    }
    
    return (
      <div>
        
      </div>
    )
  }
}
