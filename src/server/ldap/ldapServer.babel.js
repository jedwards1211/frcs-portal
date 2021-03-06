/* eslint-disable prefer-const */

'use strict'

if (process.env.NODE_ENV !== 'production') {
  if (require('piping')({
    hook: false,
    ignore: /(\/\.|~$|\.json$)/i
  })) {
    return
  }
}

require('babel-register')
require('babel-polyfill')

let getDotenv = require('../../universal/utils/dotenv').getDotenv

// Import .env and expand variables:
getDotenv()

require('./ldapServer')
