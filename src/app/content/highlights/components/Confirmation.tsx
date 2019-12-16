import Color from 'color';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import { labelStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { cardPadding } from '../constants';
import { cardBorder } from './style';

// tslint:disable-next-line:variable-name
export const Overlay = styled.div`
  background: ${Color(theme.color.black).alpha(0.90).string()};
  outline: none;
  ${cardBorder}
  transition: background 200ms;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  top: 0;
  right: 0;
  left: 0;
  overflow: visible;
  min-height: 100%;

  label {
    ${labelStyle}
    flex: 1;
    color: ${theme.color.text.white};
    margin-bottom: ${cardPadding}rem;
  }
`;

interface Props {
  message: string;
  'data-analytics-region'?: string;
  confirmMessage: string;
  confirmLink?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  always?: () => void;
}

// tslint:disable-next-line:variable-name
const Confirmation = ({message, confirmMessage, confirmLink, always, onCancel, onConfirm, ...props}: Props) => {

  return <Overlay
    tabIndex={-1}
    {...props['data-analytics-region']
      ? {'data-analytics-region': props['data-analytics-region']}
      : {}
    }
  >
    <FormattedMessage id={message}>
      {(msg: Element | string) => <label>{msg}</label>}
    </FormattedMessage>
    <ButtonGroup>
      <FormattedMessage id={confirmMessage}>
        {(msg: Element | string) => <Button
          size='small'
          data-analytics-label='confirm'
          data-testid='confirm'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            if (!confirmLink) {
              e.preventDefault();
            }
            if (onConfirm) {
              onConfirm();
            }
            if (always) {
              always();
            }
          }}
          {...confirmLink
            // eslint-disable-next-line
            ? {component: <a href={confirmLink} />}
            : {}
          }
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            onCancel();
            if (always) {
              always();
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>
  </Overlay>;
};

export default Confirmation;
