if (process.env.NODE_ENV !== 'production') {
  if (require('piping')({
    hook: false,
    ignore: /(\/\.|~$|\.json$)/i
  })) {

    require('babel-register');
    require('babel-polyfill');

    var getDotenv = require('../../universal/utils/dotenv').getDotenv

    // Import .env and expand variables:
    getDotenv()

    require('./ldapServer');
  }
}
