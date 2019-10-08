interface Config {
  APP_ENV: 'development' | 'test' | 'production';
  SENTRY_ENABLED: boolean;
  REACT_APP_ACCOUNTS_URL: string;
  ARCHIVE_URL: string;
  REACT_APP_ARCHIVE_URL: string;
  REACT_APP_OS_WEB_API_URL: string;
  REACT_APP_SEARCH_URL: string;
  DEPLOYED_ENV: string;
  CODE_VERSION: string;
  RELEASE_ID: string;

  BOOKS: {
    [key: string]: {
      defaultVersion: string;
    };
  };

  PORT: number;
  DEBUG: boolean;
}

declare const config: Config;
export = config;
