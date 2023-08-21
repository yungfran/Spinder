const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  console.log("starting proxy");
  app.use(
    '/login',
    createProxyMiddleware({
      target: 'http://localhost:8888', 
      changeOrigin: true,
    })
  );
};