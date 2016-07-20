require('babel-register')
require('babel-polyfill')
require('../../universal/utils/dotenv').getDotenv()
require('./setupDB')(process.argv[2])

