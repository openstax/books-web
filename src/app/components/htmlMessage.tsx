import React, { ComponentType, HTMLAttributes } from 'react';
import { FormattedHTMLMessage, MessageValue } from 'react-intl';
import { assertString } from '../utils';

interface Props {values?: {[key: string]: MessageValue}; }

// tslint:disable-next-line:variable-name
type Type = <T extends any>(messageKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<Props & HTMLAttributes<T>>;

// tslint:disable-next-line:variable-name
const htmlMessage: Type = (messageKey, Component) => ({values, ...props}) =>
  <FormattedHTMLMessage id={messageKey} values={values ? values : {}}>
    {(msg: string | Element) =>
      <Component dangerouslySetInnerHTML={{__html: assertString(msg, `${messageKey} must be a string`)}} {...props} />
    }
  </FormattedHTMLMessage>
;

export default htmlMessage;
