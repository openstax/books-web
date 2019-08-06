import React from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import enMessages from './messages/en';

addLocaleData(en);

// tslint:disable-next-line:variable-name
const MessageProvider: React.SFC = (props) =>
  <IntlProvider locale='en' messages={enMessages}>{props.children}</IntlProvider>;

export default MessageProvider;
