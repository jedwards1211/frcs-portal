var req = require.context('../', true, /__tests__\/(client\/)?unit\/.*\.jsx?$/);
req.keys().forEach(req);
