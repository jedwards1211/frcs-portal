import React, {Component} from 'react'
import styles from './Header.css'

export default class Header extends Component {
  render() {
    return (
      <div className={styles.header}>
        <div className={styles.banner}>
          <h1 className={styles.bannerTitle}>Detroit Urban Grotto</h1>
          <h3 className={styles.bannerDesc}>Member Portal</h3>
        </div>
      </div>
    )
  }
}
