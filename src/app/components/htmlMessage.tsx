import React, { ComponentType, HTMLAttributes } from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import { assertString } from '../utils';

type Props = Pick<React.ComponentProps<typeof FormattedHTMLMessage>, 'values'>;

// tslint:disable-next-line:variable-name
type Type = <T extends any>(messageKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<Props & HTMLAttributes<T>>;

// tslint:disable-next-line:variable-name
const htmlMessage: Type = (messageKey, Component) => ({values, id, ...props}) =>
  <FormattedHTMLMessage id={id || messageKey} values={values ? values : {}}>
    {(msg: string | Element) =>
      <Component dangerouslySetInnerHTML={{__html: assertString(msg, `${messageKey} must be a string`)}} {...props} />
    }
  </FormattedHTMLMessage>
;

export default htmlMessage;
