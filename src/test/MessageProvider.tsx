import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React from 'react';
import { RawIntlProvider } from 'react-intl';
import createTestServices from './createTestServices';

interface Props {
  locale?: string;
  messages?: Record<string, string>;
}

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

// tslint:disable-next-line:variable-name
const MessageProvider = ({children, ...props}: React.PropsWithChildren<Props>) => {
  const intlObject = createTestServices().intl.getIntlObject(props.locale, props.messages);

  return <RawIntlProvider value={intlObject}>
    {children}
  </RawIntlProvider>;
};

export default MessageProvider;
