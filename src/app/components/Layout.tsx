import React, { SFC } from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../theme';
import NavBar from './NavBar';
import SkipToContentWrapper from './SkipToContentWrapper';

// tslint:disable-next-line:variable-name
const Layout: SFC = ({children}) => <SkipToContentWrapper>
  <NavBar />
  {children}
</SkipToContentWrapper>;

export const wrapperPadding = css`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LayoutBody = styled.div`
  min-height: 100%;
  width: 100%;
  ${wrapperPadding}
`;

export default Layout;
