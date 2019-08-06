import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import MobileScrollLock from '../../components/MobileScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
} from './constants';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div<{isOpen: State['tocOpen']}>`
  @media screen {
    flex: 1;
    width: 100%;
    overflow: visible;
    transition: margin-left ${sidebarTransitionTime}ms;
    ${styleWhenSidebarClosed(css`
      margin-left: -${sidebarDesktopWidth}rem;
    `)}

    ${theme.breakpoints.mobile(css`
      margin-left: -${sidebarMobileWidth}rem;
    `)}
  }
`;

interface Props {
  isOpen: State['tocOpen'];
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const ContentPane = ({isOpen, onClick, children}: React.PropsWithChildren<Props>) => <Wrapper isOpen={isOpen}>
  {isOpen && <MobileScrollLock onClick={onClick} />}
  {children}
</Wrapper>;

const dispatchConnector = connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(closeToc()),
  })
);

export default isOpenConnector(dispatchConnector(ContentPane));
