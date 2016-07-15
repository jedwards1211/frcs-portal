import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List'
import {push} from 'react-router-redux'
import styles from './Home.css'
import owncloudLogo from './owncloud.svg'
import svnLogo from './subversion.svg'
import ContentCopy from 'material-ui/svg-icons/content/content-copy'
import CloudDownload from 'material-ui/svg-icons/file/cloud-download'
import FileDownload from 'material-ui/svg-icons/file/file-download'
import SettingsContainer from '../../../settings/containers/SettingsContainer'
import Contacts from 'material-ui/svg-icons/communication/contacts'
import Money from 'material-ui/svg-icons/editor/attach-money'

export default class Home extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    user: PropTypes.object,
    dispatch: PropTypes.func,
  };
  
  copySvnURL = () => {
    this.svnTextField.select()
    document.execCommand('copy')
  };
  
  render() {
    const {isAuthenticated, user, dispatch} = this.props

    if (isAuthenticated && user) {
      const displayName = user.get('firstName') || user.get('username')
      const isVerified = user.getIn(['strategies', 'local', 'isVerified'])
      
      const {hostname} = window.location
      
      const owncloudLink = path => `/owncloud/index.php/apps/files/?dir=%2F${(path || '').replace(/\//g, '%2F').replace(/ /g, '%20')}`

      return (
        <div className={styles.home}>
          <h2 className={styles.header}>Welcome, {displayName}!</h2>
          {isVerified
            ? <div>
              <SettingsContainer>
                {({settings: {current}}) => {
                  const {memberSpreadsheet} = current || {}
                  return (memberSpreadsheet 
                    ? <div className={styles.services}>
                      <Paper className={styles.directorySection}>
                        <ListItem leftIcon={<Contacts />}
                                  href={`https://docs.google.com/spreadsheets/d/${memberSpreadsheet.id}/edit#gid=${memberSpreadsheet.directorySheetId}`}>
                          <strong>Member Directory</strong>
                        </ListItem>
                      </Paper>
                      <Paper className={styles.accountingSection}>
                        <ListItem leftIcon={<Money />}
                                  href={`https://docs.google.com/spreadsheets/d/${memberSpreadsheet.id}/edit#gid=${memberSpreadsheet.journalSheetId}`}>
                          <strong>Accounting Spreadsheet</strong>
                        </ListItem>
                      </Paper>
                    </div>
                    : <div/>
                  )
                }}
              </SettingsContainer>
              <div className={styles.services}>
                <Paper className={styles.owncloudSection} rounded={false}>
                  <List className={styles.owncloudList} style={{paddingTop: 0, paddingBottom: 0}}>
                    <ListItem innerDivStyle={{padding: 0}} href={owncloudLink()}>
                      <img className={styles.owncloudLogo} src={owncloudLogo} />
                    </ListItem>
                    <Divider />
                    <ListItem href="https://owncloud.org/install/#install-clients" rightIcon={<CloudDownload />}>
                      <strong>
                        Install ownCloud sync client
                      </strong>
                    </ListItem>
                    <Divider />
                    <ListItem href={owncloudLink('SurveyScans')}>Scanned Survey Notes</ListItem>
                    <ListItem href={owncloudLink('Shared Photos')}>Photos</ListItem>
                    <ListItem href={owncloudLink('Trip Reports')}>Trip Reports</ListItem>
                    <ListItem href={owncloudLink('Plots')}>Plots</ListItem>
                    <ListItem href={owncloudLink('breakout')}>Breakout Data</ListItem>
                    <ListItem href={owncloudLink('compass')}>Compass Data</ListItem>
                    <ListItem href={owncloudLink('walls')}>Walls Data</ListItem>
                  </List>
                </Paper>
                <Paper className={styles.svnSection} rounded={false}>
                  <List className={styles.svnList} style={{paddingTop: 0, paddingBottom: 0}}>
                    <ListItem innerDivStyle={{padding: 0}} href="https://subversion.apache.org/">
                      <img className={styles.svnLogo} src={svnLogo} />
                    </ListItem>
                    <Divider />
                    <ListItem rightIcon={<ContentCopy />} onTouchTap={this.copySvnURL}>
                      <strong>URL: </strong>
                      <TextField style={{height: 'initial'}} underlineStyle={{bottom: 0}} 
                                 value={`svn+ssh://${hostname}/svn`}
                                 ref={c => this.svnTextField = c} />
                    </ListItem>
                    <ListItem href="http://www.smartsvn.com/download" rightIcon={<FileDownload />}>
                      <strong>
                        Install SmartSVN Client (recommended)
                      </strong>
                    </ListItem>
                    <ListItem href="https://tortoisesvn.net/" rightIcon={<FileDownload />}>
                      Install TortoiseSVN Client (Windows only)
                    </ListItem>
                    <Divider />
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
