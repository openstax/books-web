import React from 'react';
import styled, { css } from 'styled-components/macro';
import { navDesktopHeight, navMobileHeight } from '../../../../components/NavBar';
import Times from '../../../../components/Times';
import theme from '../../../../theme';
import { State } from '../../../types';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight
} from '../../constants';
import { CloseSidebarControl, ToCButtonText } from '../../SidebarControl';
import { toolbarIconStyles } from '../../Toolbar/styled';
import { disablePrint } from '../../utils/disablePrint';
import { styleWhenSidebarClosed } from '../../utils/sidebar';

const sidebarPadding = 1.8;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-${sidebarDesktopWidth}rem);
  box-shadow: none;
  background-color: transparent;
  pointer-events: none;

  > * {
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const SidebarBody = styled.div<{isOpen: State['tocOpen']}>`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  margin-top: -${toolbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight}rem);
  transition:
    transform ${sidebarTransitionTime}ms ease-in-out,
    box-shadow ${sidebarTransitionTime}ms ease-in-out,
    background-color ${sidebarTransitionTime}ms ease-in-out;
  background-color: ${theme.color.neutral.darker};
  z-index: 3; /* stay above book content and overlay */
  margin-left: -50vw;
  padding-left: 50vw;
  width: calc(50vw + ${sidebarDesktopWidth}rem);
  min-width: calc(50vw + ${sidebarDesktopWidth}rem);
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${sidebarMobileWidth}rem);
    min-width: calc(50vw + ${sidebarMobileWidth}rem);
    margin-top: -${toolbarMobileHeight}rem;
    top: ${bookBannerMobileMiniHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileMiniHeight}rem);
  `)}

  display: flex;
  flex-direction: column;

  > ol {
    -webkit-overflow-scrolling: touch;
    position: relative;
    padding: ${sidebarPadding}rem ${sidebarPadding}rem ${sidebarPadding}rem 0.2rem;
    flex: 1;

    > li:first-child {
      margin-top: 0;
    }

    ::before {
      content: "";
      background: ${theme.color.neutral.darker};
      display: block;
      height: ${sidebarPadding}rem;
      margin: -${sidebarPadding}rem -${sidebarPadding}rem 0 -${sidebarPadding}rem;
    }
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    opacity: 1;
  }

  ${styleWhenSidebarClosed(sidebarClosedStyle)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${toolbarDesktopHeight}rem;
  overflow: visible;
  box-shadow: 0 1rem 1rem -1rem rgba(0, 0, 0, 0.14);
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  margin-right: 0;
  padding-right: 0;
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
`;

// tslint:disable-next-line:variable-name
export const SidebarHeaderButton = styled((props) => <CloseSidebarControl {...props} />)`
  display: flex;
  margin-right: ${sidebarPadding}rem;
  flex: 1;
  ${/* stylelint broken */ css`
    ${ToCButtonText}, ${ToCHeader} {
      flex: 1;
      text-align: left;
    }
  `}
`;
