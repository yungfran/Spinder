const setupMiddlewares = require('./middleware');

module.exports = function(app) {
  setupMiddlewares(app);
};