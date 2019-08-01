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
    /* Anatomy & Physiology */ '14fb4ad7-39a1-4eee-ab6e-3ef2482e3e22': {defaultVersion: '15.5'},
    /* Astronomy */ '2e737be8-ea65-48c3-aa0a-9f35b4c6a966': {defaultVersion: '21.8'},
    /* Biology 2e */ '8d50a0af-948b-4204-a71d-4826cba765b8': {defaultVersion: '15.43'},
    /* Biology for AP Courses */ '6c322e32-9fb0-4c4d-a1d7-20c95c5c7af2': {defaultVersion: '18.3'},
    /* Chemistry 2e */ '7fccc9cf-9b71-44f6-800b-f9457fd64335': {defaultVersion: '7.4'},
    /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f': {defaultVersion: '5.10'},
    /* College Physics */ '031da8d3-b525-429c-80cf-6c8ed997733a': {defaultVersion: '16.17'},
    /* College Physics for AP® Courses */ '8d04a686-d5e8-4798-a27d-c608e4d0e187': {defaultVersion: '25.6'},
    /* Concepts of Biology */ 'b3c1e1d2-839c-42b0-a314-e119a8aafbdd': {defaultVersion: '15.8'},
    /* Microbiology */ 'e42bd376-624b-4c0f-972f-e0c57998e765': {defaultVersion: '7.1'},
  },

  PORT: 8000,
};
