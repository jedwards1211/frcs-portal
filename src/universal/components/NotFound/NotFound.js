import React, {Component} from 'react'

export default class NotFound extends Component {
  render() {
    return (
      <div style={{maxWidth: 600, margin: '15px auto', textAlign: 'center'}}>
        <h1>Page not found: {this.props.location.pathname}</h1>
      </div>
    )
  }
}
