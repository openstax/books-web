import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';
import React, { useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { book as bookSelector } from '../content/selectors';
import { useServices } from '../context/Services';
import { match as matchSelector } from '../navigation/selectors';

// https://formatjs.io/docs/polyfills/intl-pluralrules/#dynamic-import--capability-detection
async function polyfill(locale: string) {
  if (shouldPolyfill()) {
    await import('@formatjs/intl-pluralrules/polyfill');
  }

  // boolean added by the polyfill
  if ((Intl.PluralRules as (typeof Intl.PluralRules & {polyfilled?: boolean})).polyfilled) {
    await import(`@formatjs/intl-pluralrules/locale-data/${locale}`);
  }
}

// tslint:disable-next-line:variable-name
const MessageProvider = (props: { children?: React.ReactNode }) => {
  const book = useSelector(bookSelector);
  const route = useSelector(matchSelector)?.route;
  const [polyfillLoaded, setPolyfillLoaded] = useState(false);
  const [intl, setIntl] = useState<IntlShape | null>(null);

  const bookLocale = React.useMemo(() => {
    return route?.locale || book?.language;
  }, [book, route]);

  const intlService = useServices().intl;

  useEffect(() => {
    if (!bookLocale) {
      return;
    }

    const doPolyfill = async() => {
      await polyfill(bookLocale);
      setPolyfillLoaded(true);
    };

    const setUpIntl = async() => {
      const intlObject = await intlService.getIntlObject(bookLocale);
      setIntl(intlObject);
    };

    setUpIntl();
    doPolyfill();
  }, [intlService, bookLocale]);

  return intl && polyfillLoaded ? (
    <RawIntlProvider value={intl}>
      {props.children}
    </RawIntlProvider>
  ) : null;
};

export default MessageProvider;
