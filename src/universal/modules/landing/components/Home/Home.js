import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import {List, ListItem} from 'material-ui/List'
import {push} from 'react-router-redux'
import styles from './Home.css'
import owncloudLogo from './owncloud.svg'
import svnLogo from './subversion.svg'

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
      
      const {protocol, host} = window.location

      return (
        <div className={styles.home}>
          <h2 className={styles.header}>Welcome, {displayName}!</h2>
          {isVerified
            ? <div>
              <h3>Looking for data?</h3>
              <div className={styles.services}>
                <Paper className={styles.owncloudSection}>
                  <a href={`${protocol}//${host}/owncloud`}>
                    <img className={styles.owncloudLogo} src={owncloudLogo} />
                  </a>
                  <Divider />
                  <List className={styles.owncloudText}>
                    <ListItem>Scanned Survey Notes</ListItem>
                    <ListItem>Trip Reports</ListItem>
                    <ListItem>Maps</ListItem>
                    <ListItem>Scoops Back Issues</ListItem>
                    <ListItem>Breakout Data</ListItem>
                    <ListItem>Compass Data</ListItem>
                    <ListItem>Walls Data</ListItem>
                  </List>
                </Paper>
                <Paper className={styles.svnSection}>
                  <a href>
                    <img className={styles.svnLogo} src={svnLogo} />
                  </a>
                  <Divider />
                  <List className={styles.svnText}>
                    <ListItem>Chipdata</ListItem>
                    <ListItem>In-progress Maps</ListItem>
                  </List>
                </Paper>
              </div>
            </div>
            : <div>
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
