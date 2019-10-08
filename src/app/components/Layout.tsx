import React, { SFC } from 'react';
import styled, { css } from 'styled-components/macro';
import ErrorBoundary from '../errors/components/ErrorBoundary';
import ErrorModal from '../errors/components/ErrorModal';
import theme from '../theme';
import NavBar from './NavBar';
import SkipToContentWrapper from './SkipToContentWrapper';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({ children }) => <SkipToContentWrapper>
  <NavBar />
  <ErrorModal />
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</SkipToContentWrapper>;

export const wrapperPadding = css`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LayoutBody = styled.div`
  width: 100%;
  ${wrapperPadding}
`;

export default Layout;
