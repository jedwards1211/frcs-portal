var req = require.context('../', true, /__tests__\/(server\/)?unit\/.*\.jsx?$/)
req.keys().forEach(req)
