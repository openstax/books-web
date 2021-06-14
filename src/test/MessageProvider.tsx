import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React from 'react';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import enMessages from '../app/messages/en';
import createTestServices from './createTestServices';

// https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
async function polyfill(locale: 'en') {
  if (shouldPolyfill()) {
    await import('@formatjs/intl-pluralrules/polyfill');
  }

  // boolean added by the polyfill
  if ((Intl.PluralRules as (typeof Intl.PluralRules & {polyfilled?: boolean})).polyfilled) {
    await import(`@formatjs/intl-pluralrules/locale-data/${locale}`);
  }
}

polyfill('en');

const cache = createIntlCache();

export const intl = createIntl({
  locale: 'en',
  messages: enMessages,
}, cache);

// tslint:disable-next-line:variable-name
const MessageProvider: React.FC = (props) =>
  <RawIntlProvider value={createTestServices().intl.getIntlObject()}>
    {props.children}
  </RawIntlProvider>;

export default MessageProvider;
