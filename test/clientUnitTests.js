require('../../webpack/lib/core-js-no-number')
require('regenerator-runtime/runtime')
var req = require.context('../', true, /__tests__\/(client\/)?unit\/.*\.jsx?$/)
req.keys().forEach(req)
