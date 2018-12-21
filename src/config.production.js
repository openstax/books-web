
if (!process.env.REACT_APP_RELEASE_ID) {
  throw new Error('REACT_APP_RELEASE_ID environment variable must be defined in production.');
}
if (!process.env.REACT_APP_CODE_VERSION) {
  throw new Error('REACT_APP_CODE_VERSION environment variable must be defined in production.');
}
if (!process.env.REACT_APP_BOOKS) {
  throw new Error('REACT_APP_BOOKS environment variable must be defined in production.');
}

module.exports = {
  RELEASE_ID: process.env.RELEASE_ID,
  CODE_VERSION: process.env.CODE_VERSION,

  REACT_APP_BOOKS: process.env.REACT_APP_BOOKS,

  FIXTURES: false,
  DEBUG: false,

  PORT: 8000,
};
