import React from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from './messages/en';

if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill'); // tslint:disable-line:no-var-requires
  require('@formatjs/intl-pluralrules/dist/locale-data/en'); // tslint:disable-line:no-var-requires
}

// tslint:disable-next-line:variable-name
const MessageProvider: React.SFC = (props) =>
  <IntlProvider locale='en' messages={enMessages}>{props.children}</IntlProvider>;

export default MessageProvider;
