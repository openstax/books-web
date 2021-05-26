import { createIntl, createIntlCache } from 'react-intl';
import enMessages from '../app/messages/en';
import plMessages from '../app/messages/pl';

export default () => {
  return {
    getIntlObject: (locale: string = 'en') => {
        const cache = createIntlCache();

        const intl = createIntl({
          locale,
          messages: locale === 'pl' ? plMessages : enMessages,
        }, cache);

        return intl;
    },
  };
};
