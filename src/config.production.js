if (!process.env.REACT_APP_RELEASE_ID) {
  throw new Error('REACT_APP_RELEASE_ID environment variable must be defined in production.');
}
if (!process.env.REACT_APP_CODE_VERSION) {
  throw new Error('REACT_APP_CODE_VERSION environment variable must be defined in production.');
}

module.exports = {
  RELEASE_ID: process.env.REACT_APP_RELEASE_ID,
  CODE_VERSION: process.env.REACT_APP_CODE_VERSION,

  FIXTURES: false,
  DEBUG: false,

  BOOKS: process.env.REACT_APP_BOOKS || {
    /* Chemistry 2e */ '7fccc9cf-9b71-44f6-800b-f9457fd64335':{defaultVersion:'7.4'},
    /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f':{defaultVersion: '5.9'},
  },

  PORT: 8000,
};
