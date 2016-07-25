/* eslint react/no-danger:0 */
import React, {Component, PropTypes} from 'react'
import {Provider} from 'react-redux'
import {RouterContext} from 'react-router'
import {renderToString} from 'react-dom-stream/server'

// Injects the server rendered state and app into a basic html template
export default class Html extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    assets: PropTypes.object,
    env: PropTypes.object,
    settings: PropTypes.object,
    renderProps: PropTypes.object
  }

  render() {
    const PROD = process.env.NODE_ENV === 'production'
    const {title, store, assets, settings, renderProps} = this.props
    const {manifest, app, vendor} = assets || {}
    const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())}`
    const root = PROD && renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>)

    const settingsScript = `window.__settings__ = ${JSON.stringify(settings || {})}`

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta name="description" content="" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          {PROD && <link rel="stylesheet" href="/static/prerender.css" type="text/css" />}
          <title>{title}</title>
        </head>
        <body>
          <script dangerouslySetInnerHTML={{__html: settingsScript}} />
          <script dangerouslySetInnerHTML={{__html: initialState}} />
          {PROD ? <div id="root" dangerouslySetInnerHTML={{__html: root}}></div> : <div id="root"></div>}
          {PROD && <script dangerouslySetInnerHTML={{__html: manifest.text}} />}
          {PROD && <script src={vendor.js} />}
          <script src={PROD ? app.js : '/static/app.js'} />
        </body>
      </html>
    )
  }
}
