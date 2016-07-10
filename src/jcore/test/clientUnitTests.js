require('../../webpack/lib/core-js-no-number')
require('regenerator-runtime/runtime')
var req = require.context('../', true, /__tests__\/(client\/)?unit\/.*\?$/)
req.keys().forEach(req)
