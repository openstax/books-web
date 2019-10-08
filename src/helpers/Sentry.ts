import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import createSentryMiddleware from 'redux-sentry-middleware';
import config from '../config';

let IS_INITIALIZED = false;

export default {

  initializeWithMiddleware() {
    Sentry.init({
      dist: config.RELEASE_ID,
      dsn: 'https://84d2036467d546038347f0ac9ccd8b3b:c815982d89764df583493a60794e54aa@sentry.cnx.org/17',
      environment: config.DEPLOYED_ENV,
      integrations: [
        new Integrations.ExtraErrorData(),
        new Integrations.CaptureConsole(),
        new Integrations.Dedupe(),
      ],
      release: `rex@${config.RELEASE_ID}`,
    });
    IS_INITIALIZED = true;
    return createSentryMiddleware(Sentry);
  },

  get isEnabled() {
    return IS_INITIALIZED && config.SENTRY_ENABLED;
  },

  get shouldCollectErrors() {
    return config.SENTRY_ENABLED;
  },

  captureException(error: any) {
    if (this.isEnabled) {
      Sentry.captureException(error);
    } else if (!this.shouldCollectErrors) {
      console.error(error); // tslint:disable-line:no-console
    }
  },

  captureMessage(message: string, level: Sentry.Severity) {
    if (this.isEnabled) {
      Sentry.captureMessage(message, level);
    }
  },

  log(message: string) {
    this.captureMessage(message, Sentry.Severity.Log);
  },

  warn(message: string) {
    this.captureMessage(message, Sentry.Severity.Warning);
  },

  error(message: string) {
    this.captureMessage(message, Sentry.Severity.Error);
  },

};
