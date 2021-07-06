import { createIntl, createIntlCache } from 'react-intl';
import Sentry from '../../helpers/Sentry';
import enMessages from '../messages/en/index';

export default () => {
  return {
    getIntlObject: async(locale: string) => {
        const cache = createIntlCache();
        let messages;

        try {
          messages = await require(`./${locale}`).default;
        } catch (e) {
          messages = enMessages;
          Sentry.captureException(e);
        }

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
