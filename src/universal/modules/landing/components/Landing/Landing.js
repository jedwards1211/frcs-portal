import React, {PropTypes, Component} from 'react'
import Navigation from 'universal/components/Navigation/Navigation'
import MenuItem from 'material-ui/MenuItem'
import Drawer from 'material-ui/Drawer'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import styles from './Landing.css'
import {push} from 'react-router-redux'

import {setShowMenu} from '../../redux/landing'

export default class Landing extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    showMenu: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };
  
  push = location => {
    const {dispatch} = this.props
    dispatch(setShowMenu(false))
    dispatch(push(location))
  };
  
  render() {
    const {dispatch, isAuthenticated, showMenu, children} = this.props
    return (
      <div>
        <Navigation dispatch={dispatch} showMenu={showMenu} isAuthenticated={isAuthenticated} />
        <Drawer open={showMenu}>
          <AppBar
            iconElementLeft={
              <IconButton onTouchTap={() => dispatch(setShowMenu(false))}><NavigationClose /></IconButton>
            }
            title="Menu"
          />
          {isAuthenticated && <MenuItem onTouchTap={() => this.push('/logout')}>Log Out</MenuItem>}
          {isAuthenticated && <MenuItem onTouchTap={() => this.push('/account/changeEmail')}>Change Email</MenuItem>}
          {isAuthenticated && <MenuItem onTouchTap={() => this.push('/account/changePassword')}>Change Password</MenuItem>}
          {!isAuthenticated && <MenuItem onTouchTap={() => this.push('/login')}>Log In</MenuItem>}
          {!isAuthenticated && <MenuItem onTouchTap={() => this.push('/signup')}>Sign Up</MenuItem>}
        </Drawer>
        <div className={styles.component}>
          {children}
        </div>
      </div>
    )
  }
}
