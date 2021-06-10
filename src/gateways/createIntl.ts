import { createIntl, createIntlCache } from 'react-intl';

export default () => {
  return {
    getIntlObject: async(locale: string = 'en') => {
        const cache = createIntlCache();
        const messages = await require(`../app/messages/${locale}`).default;

        const intl = createIntl({
          locale,
          messages,
        }, cache);

        return intl;
    },
  };
};
