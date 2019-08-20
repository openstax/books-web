import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { ListOl } from 'styled-icons/fa-solid/ListOl';
import { contentFont, textRegularSize } from '../../components/Typography';
import { AppState, Dispatch } from '../../types';
import { assertString } from '../../utils';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { State } from '../types';
import { toolbarIconColor } from './constants';
import { toolbarIconStyles } from './Toolbar/styled';

interface InnerProps {
  message: string;
  onClick: () => void;
  className?: string;
}
interface MiddleProps {
  isOpen: State['tocOpen'];
  openToc: () => void;
  closeToc: () => void;
}

// tslint:disable-next-line:variable-name
const ListIcon = styled(ListOl)`
  ${toolbarIconStyles};
  margin-right: 0.5rem;
`;

// tslint:disable-next-line:variable-name
export const ToCButtonText = styled.span`
  font-family: ${contentFont};
  font-weight: 600;
  ${textRegularSize};
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.button`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: none;
  display: flex;
  align-items: center;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

const closedMessage = 'i18n:toc:toggle:closed';
const openMessage = 'i18n:toc:toggle:opened';

// tslint:disable-next-line:variable-name
export const SidebarControl: React.SFC<InnerProps> = ({message, children, ...props}) =>
  <FormattedMessage id={message}>
    {(msg: Element | string) => {
      const txt = assertString(msg, 'Aria label only supports strings');
      return <ToCButton aria-label={txt} {...props}>
        <ListIcon/><ToCButtonText>Table of contents</ToCButtonText>
        {children}
      </ToCButton>;
    }}
  </FormattedMessage>;

const connector = connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    closeToc:  () => dispatch(actions.closeToc()),
    openToc: () => dispatch(actions.openToc()),
  })
);

// tslint:disable-next-line:variable-name
const lockControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  connector((props: MiddleProps) => <Control
    {...props}
    message={isOpen ? openMessage : closedMessage}
    onClick={isOpen ? props.closeToc : props.openToc}
  />);

// tslint:disable-next-line:variable-name
export const OpenSidebarControl = lockControlState(false, SidebarControl);

// tslint:disable-next-line:variable-name
export const CloseSidebarControl = lockControlState(true, SidebarControl);
