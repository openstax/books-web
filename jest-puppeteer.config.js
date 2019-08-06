const path = require('path');
const {PORT, PUPPETEER_DEBUG, SERVER_MODE} = require('./src/config');
const {userInfo} = require('os');

module.exports = {
  launch: {
    defaultViewport: {
      width: 1200,
      height: 400,
    },
    args: [
      ...(userInfo().username === 'root' ? [
        // so that tests can be run as root, if you're into that sort of thing.
        '--no-sandbox',
      ] : []),
      // https://github.com/GoogleChrome/puppeteer/issues/2410
      '--font-render-hinting=medium',
    ],
    devtools: PUPPETEER_DEBUG,
  },
  server: {
    launchTimeout: 60000,
    command: SERVER_MODE === 'built'
      ? `REACT_APP_ENV=test HTTPS=false PORT=${PORT} yarn server`
      : `REACT_APP_ENV=test HTTPS=false PORT=${PORT} BROWSER=none yarn start`,
    port: PORT,
  },
}
