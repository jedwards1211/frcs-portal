import AppBar from 'material-ui/AppBar';
import React, {PropTypes, Component} from 'react'
import {push} from 'react-router-redux'
import styles from './Navigation.css'

import {setShowMenu} from '../../modules/landing/redux/landing'

export default class Navigation extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  render() {
    const {isAuthenticated, dispatch} = this.props
    
    return (
      <AppBar
        onLeftIconButtonTouchTap={() => dispatch(setShowMenu(true))}
        onTitleTouchTap={() => dispatch(push('/'))}
        title={<span className={styles.brand}>DUG Member Portal</span>}
      />
    )
  }
}
