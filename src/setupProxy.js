/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
const url = require('url');
const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy-middleware');
const {FIXTURES, ARCHIVE_URL, OS_WEB_URL} = require('./config');

const archivePaths = [
  'contents',
  'resources',
  'specials',
];

module.exports = function(app) {
  FIXTURES
    ? setupTestProxy(app)
    : setupProxy(app);
};

function setupTestProxy(app) {
  console.info('WEBSERVER: Including fixtures');

  app.use((req, res, next) => {
    const parts = url.parse(req.url);
    const integrateQuery = parts.pathname + (parts.search ? encodeURIComponent(parts.search) : '');
    const filePath = path.join(__dirname, 'test/fixtures', integrateQuery);

    if (fs.existsSync(filePath)) {
      fs.readFile(filePath, 'utf8', (err, contents) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(contents);
      });
    } else {
      next();
    }
  });
}

function setupProxy(app) {
  if (!ARCHIVE_URL) { throw new Error('ARCHIVE_URL configuration must be defined'); }
  if (!OS_WEB_URL) { throw new Error('OS_WEB_URL configuration must be defined'); }

  archivePaths.forEach(path => app.use(proxy(`/${path}`, {
    target: `${ARCHIVE_URL}${path}/`,
    prependPath: false,
    changeOrigin: true,
  })));

  app.use(proxy((path) => !path.match(/^\/(books\/.*?\/pages)|(static)|(errors)/), {
    target: OS_WEB_URL,
    changeOrigin: true,
  }));
}
