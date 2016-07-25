/* eslint-env browser */
let settings

if (__CLIENT__) {
  settings = window.__settings__ || {}
} else {
  settings = require('../../server/settings')
}

export default settings
