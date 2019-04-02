import React from 'react';
import styled, { css } from 'styled-components';
import Layout from '../../components/Layout';
import { navDesktopHeight } from '../../components/NavBar';
import Notifications from '../../notifications/components/Notifications';
import { inlineDisplayBreak } from '../../notifications/theme';
import theme from '../../theme';
import Attribution from './Attribution';
import BookBanner from './BookBanner';
import CenteredContent from './CenteredContent';
import {
  bookBannerDesktopHeight,
  contentWrapperMaxWidth,
  mainContentBackground,
  sidebarDesktopWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight
} from './constants';
import ContentPane from './ContentPane';
import Page from './Page';
import PrevNextBar from './PrevNextBar';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { isOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';
import Wrapper from './Wrapper';
import { wrapperPadding } from './Wrapper';

// tslint:disable-next-line:variable-name
const Background = styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  background-color: ${theme.color.neutral.darker};
  width: 100%;
  min-height: 100%;
`;

// tslint:disable-next-line:variable-name
const ContentNotifications = styled(Notifications)`
  top: ${bookBannerDesktopHeight + toolbarDesktopHeight + navDesktopHeight}rem;

  @media (max-width: ${inlineDisplayBreak}) {
    top: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    ${wrapperPadding}
  }
`;

// tslint:disable-next-line:variable-name
const CenteredContentRow = styled(CenteredContent)`
  min-height: 100%;
  display: flex;
  flex-direction: row;
`;

// tslint:disable-next-line:variable-name
const UndoPadding = isOpenConnector(styled.div`
  margin-right: -${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    margin: 0 -${theme.padding.page.mobile}rem;
  `)}

  ${styleWhenSidebarClosed(css`
    margin-left: -${theme.padding.page.desktop}rem;
    ${theme.breakpoints.mobile(css`
      margin-left: -${theme.padding.page.mobile}rem;
    `)}
  `)}
`);

// tslint:disable-next-line:variable-name
const MainContentWrapper = isOpenConnector(styled.div`
  overflow: visible;
  background-color: ${mainContentBackground};
  transition: max-width ${sidebarTransitionTime}ms;
  max-width: ${contentWrapperMaxWidth - sidebarDesktopWidth}rem;
  ${styleWhenSidebarClosed(css`
    max-width: ${contentWrapperMaxWidth}rem;
    margin: 0 auto;
  `)}
`);

// tslint:disable-next-line:variable-name
const HideOverflowAndRedoPadding = isOpenConnector(styled.div`
  ${wrapperPadding}
  ${styleWhenSidebarClosed(css`
    ${wrapperPadding}
  `)}
`);

/*
 * this layout is a mess for these reasons:
 * - the navs must have the default padding inside their containers so their
 *   backgrounds go to the edge of the window.
 *
 * - the content wrapper must behave the same way as the navs in order to get
 *   the sidebar in the right place to line up with the button in the toolbar.
 *
 * - the white background must then have negative margin to undo the default
 *   padding so that it can get to the edge of the screen on small windows.
 *
 * - the white background can't be on the whole wrapper, because it is fixed
 *   width on large screens, and then it wouldn't go to the edge on small ones.
 *
 * - transitioning the white background from full width to fixed width, while
 *   matching the container boundaries of the navbars, is complicated.
 *
 * - the default padding is duplicated inside the white margin for small
 *   screen behavior, but it cant affect the notifications or attribution,
 *   so there is another container for that.
 *
 * - the extra container for the padding inside the white margin can't go away
 *   because it is necessary to hide the overflow of items on the Page, and contain
 *   the margins of the Page, which must be overflow: visible.
 *
 * - when the sidebar is closed the white wrapper behaves more or less the same
 *   as the default wrapper, but when the sidebar is open it only needs
 *   padding/margin on the right, because the sidebar already puts the left
 *   side in the right place, and you don't want a gap between the sidebar
 *   and the content.
 *
 * - a bunch of these containers could be combined, except that then the
 *   transitions break because you're combining things that need to be
 *   fixed with things that need to be animated.
 *
 * - the whole layout depends on using max-width to resolve when the
 *   margins should and should not be applied, and changing margins
 *   all over the place, all of which means that a disturbing number
 *   of things need to know when the sidebar is open/closed.
 */
// tslint:disable-next-line:variable-name
const Content: React.SFC = () => <Layout>
  <Background>
    <BookBanner/>
    <Toolbar />
    <Wrapper>
      <CenteredContentRow>
        <Sidebar />
        <ContentPane>
          <UndoPadding>
            <MainContentWrapper>
              <ContentNotifications />
              <HideOverflowAndRedoPadding>
                <Page />
              </HideOverflowAndRedoPadding>
              <PrevNextBar />
              <Attribution />
            </MainContentWrapper>
          </UndoPadding>
        </ContentPane>
      </CenteredContentRow>
    </Wrapper>
  </Background>
</Layout>;

export default Content;
