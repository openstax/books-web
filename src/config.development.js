module.exports = {
  RELEASE_ID: 'development',
  CODE_VERSION: 'development',
  DEPLOYED_ENV: 'development',

  ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts-dev.openstax.org',
  OS_WEB_URL: process.env.OS_WEB_URL || 'https://cms-dev.openstax.org',
  SEARCH_URL: process.env.SEARCH_URL || 'https://search-aug12d.sandbox.openstax.org',

  SKIP_OS_WEB_PROXY: process.env.SKIP_OS_WEB_PROXY !== undefined,
  FIXTURES: false,
  DEBUG: true,

  BOOKS: {
    /* College Physics */ '031da8d3-b525-429c-80cf-6c8ed997733a': {defaultVersion: '17.22'},
    /* College Physics for AP */ '8d04a686-d5e8-4798-a27d-c608e4d0e187': {defaultVersion: '26.21'},
    /* Calculus vol 1 */ '8b89d172-2927-466f-8661-01abc7ccdba4': {defaultVersion: '6.47' },
    /* Calculus vol 2 */ '1d39a348-071f-4537-85b6-c98912458c3c': {defaultVersion: '5.21'},
    /* Calculus vol 3 */ 'a31cd793-2162-4e9e-acb5-6e6bbd76a5fa': {defaultVersion: '5.30' },
    /* University Physics vol 1 */ 'd50f6e32-0fda-46ef-a362-9bd36ca7c97d': {defaultVersion: '13.38'},
    /* University Physics vol 2 */ '7a0f9770-1c44-4acd-9920-1cd9a99f2a1e': {defaultVersion: '16.39'},
    /* University Physics vol 3 */ 'af275420-6050-4707-995c-57b9cc13c358': {defaultVersion: '12.18'},
  },

  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
};
