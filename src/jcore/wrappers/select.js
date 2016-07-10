import React from 'react'

module.exports = selector => Component => props => (
  <Component {...selector(props)}>
    {props.children}
  </Component>
)
