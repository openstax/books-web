import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';
import MobileScrollLock from '../../components/MobileScrollLock';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import { searchResultsBarDesktopWidth, sidebarTransitionTime } from './constants';

export { wrapperPadding } from '../../components/Layout';

interface WrapperProps {
  isOpen: boolean;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const Wrapper = styled(({isOpen, children, ...props}: React.PropsWithChildren<WrapperProps>) =>
  <LayoutBody {...props}>
    {isOpen && <MobileScrollLock overlay={false} />}
    {children}
  </LayoutBody>
)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  transition: margin-left ${sidebarTransitionTime}ms;

  @media screen {
    flex: 1;
    ${(props: WrapperProps) => props.isOpen && css`
      margin-left: ${searchResultsBarDesktopWidth}rem;
    `}

    ${theme.breakpoints.mobile(css`
      margin-left: 0;
    `)}
  }
`;

export default connect(
  (state: AppState) => ({
    isOpen: !!selectSearch.query(state) && selectSearch.searchResultsOpen(state),
  })
)(Wrapper);
