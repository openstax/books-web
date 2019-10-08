import React from 'react';
import { FormattedMessage } from 'react-intl';

export default () => {
  return <FormattedMessage id='i18n:error:404'>
    {(txt) => (
        <h1>{txt}</h1>
    )}
  </FormattedMessage>;
};
