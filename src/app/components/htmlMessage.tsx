import React, { ComponentType, HTMLAttributes } from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import { assertString } from '../utils';

type Props = Pick<React.ComponentProps<typeof FormattedHTMLMessage>, 'values'>;

// tslint:disable-next-line:variable-name
type Type = <T extends any>(msgKey: string, Component: ComponentType<HTMLAttributes<T>>) =>
  ComponentType<Props & HTMLAttributes<T>>;

// tslint:disable-next-line:variable-name
const htmlMessage: Type = (msgKey, Component) => ({values, ...props}) =>
  <FormattedHTMLMessage id={msgKey} values={values ? values : {}}>
    {(msg: string | Element) =>
      <Component
        dangerouslySetInnerHTML={{__html: assertString(msg, `${msgKey} must be a string`)}}
        {...props}
      />
    }
  </FormattedHTMLMessage>
;

export default htmlMessage;
