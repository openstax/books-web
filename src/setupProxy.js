/*
 * this file is shared between webpack-dev-server and the pre-renderer
 */
const url = require('url');
const util = require('util');
const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy-middleware');
const {
  SKIP_OS_WEB_PROXY,
  FIXTURES,
  ARCHIVE_URL,
  OS_WEB_URL,
  ACCOUNTS_URL,
  REACT_APP_ACCOUNTS_URL,
  REACT_APP_OS_WEB_API_URL
} = require('./config');

const archivePaths = [
  '/contents',
  '/resources',
  '/specials',
];

module.exports = function(app) {
  FIXTURES
    ? setupTestProxy(app)
    : setupProxy(app);
};

function getReqInfo(request) {
  const {search, pathname} = url.parse(request.url);
  const cookie = request.headers.cookie || '';
  return {
    search,
    pathname,
    authenticated: cookie.includes('session')
  };
}

const isFile = path =>
  fs.existsSync(path)
  && fs.existsSync(fs.realpathSync(path))
  && fs.lstatSync(fs.realpathSync(path)).isFile();

const isDirectory = path => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

function setupTestProxy(app) {
  console.info('WEBSERVER: Including fixtures');

  app.use((req, res, next) => {
    const reqInfo = getReqInfo(req);
    const parts = url.parse(req.url);

    const sendFile = path => {
      const body = new Promise((resolve, reject) =>
        fs.readFile(path, (err, contents) => err ? reject(err) : resolve(contents))
      );
      const statusFile = `${path}.status`;
      const status = new Promise((resolve, reject) => isFile(statusFile)
        ? fs.readFile(statusFile, (err, contents) => err ? reject(err) : resolve(contents))
        : resolve(200)
      );

      Promise.all([body, status]).then(([body, status]) => {
        res.status(status);
        res.end(body);
      });
    };

    const findFileIn = baseDir => {
      const filePath = path.join(baseDir, reqInfo.pathname);
      console.log(filePath);
      const queryFilePath = path.join(filePath,
        parts.search ? encodeURIComponent(reqInfo.search) : ''
      );
      const indexFilePath = path.join(filePath, 'index.html');

      if (isFile(queryFilePath)) {
        return queryFilePath;
      } else if (isFile(filePath)) {
        return filePath;
      } else if (isDirectory(filePath) && isFile(indexFilePath)) {
        return indexFilePath;
      } else {
        return null;
      }
    };

    const fixtureDir = path.join(__dirname, 'test/fixtures');
    const authFile = findFileIn(path.join(fixtureDir, 'authenticated'));
    const publicFile = findFileIn(fixtureDir);

    if (authFile && reqInfo.authenticated) {
      sendFile(authFile);
    } else if (publicFile) {
      sendFile(publicFile);
    } else {
      next();
    }
  });
}

function setupProxy(app) {
  if (!ARCHIVE_URL) { throw new Error('ARCHIVE_URL configuration must be defined'); }
  if (!OS_WEB_URL) { throw new Error('OS_WEB_URL configuration must be defined'); }

  archivePaths.forEach(path => app.use(proxy(path, {
    target: `${ARCHIVE_URL}${path}`,
    prependPath: false,
    changeOrigin: true,
  })));

  app.use(proxy(REACT_APP_ACCOUNTS_URL, {
    target: ACCOUNTS_URL,
    changeOrigin: true,
    autoRewrite: true,
  }));

  app.use(proxy(REACT_APP_OS_WEB_API_URL, {
    target: OS_WEB_URL,
    changeOrigin: true,
  }));

  if (!SKIP_OS_WEB_PROXY) {
    app.use(proxy((path) => !path.match(/^\/(books\/.*?\/pages\/.*)|static.*|errors.*|rex.*|api.*|\/$/), {
      target: OS_WEB_URL,
      changeOrigin: true,
    }));
  }
}
