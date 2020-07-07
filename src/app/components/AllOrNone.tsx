import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { loggedOut } from '../auth/selectors';
import { ButtonLink } from './Button';

interface Props {
  className?: string;
  onAll: () => void;
  onNone: () => void;
}

// tslint:disable-next-line:variable-name
const AllOrNone = ({className, onAll, onNone}: Props) => {
  const userLoggedOut = useSelector(loggedOut);

  return <div className={className}>
    <FormattedMessage id='i18n:highlighting:filters:all'>
      {(msg: Element | string) => <ButtonLink disabled={userLoggedOut} decorated onClick={onAll}>{msg}</ButtonLink>}
    </FormattedMessage>
    <span>|</span>
    <FormattedMessage id='i18n:highlighting:filters:none'>
      {(msg: Element | string) => <ButtonLink disabled={userLoggedOut} decorated onClick={onNone}>{msg}</ButtonLink>}
    </FormattedMessage>
  </div>;
};

export default styled(AllOrNone)`
  &,
  ${ButtonLink} {
    font-size: 1.4rem;
    overflow: visible;
  }

  height: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    padding: 0 1rem;
  }
`;
