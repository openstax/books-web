import React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Details as BaseDetails, Summary } from '../../../../components/Details';
import { navDesktopHeight } from '../../../../components/NavBar';
import Times from '../../../../components/Times';
import {
  labelStyle,
  textRegularStyle
} from '../../../../components/Typography';
import theme from '../../../../theme';
import {
    bookBannerDesktopMiniHeight,
    searchResultsBarDesktopWidth,
    searchSidebarTopOffset,
    sidebarTransitionTime,
    toolbarDesktopHeight,
    toolbarIconColor,
  } from '../../../components/constants';
import ContentLinkComponent from '../../../components/ContentLink';
import { toolbarIconStyles } from '../../../components/Toolbar/styled';
import { disablePrint } from '../../../components/utils/disablePrint';

const borderColor = '#d5d5d5';
const backgroundColor = '#f1f1f1';
const headerHeight = 4;

// tslint:disable-next-line:variable-name
export const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
  height: ${headerHeight}rem;
  color: ${theme.color.primary.gray.darker};
  margin-right: 0.7rem;
  margin-left: ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    margin-left: ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
`;

// tslint:disable-next-line:variable-name
export const NavOl = styled.ol`
  overflow: visible;

  .os-divider {
    width: 0.4rem;
  }
`;

const sidebarOpenAnimation = keyframes`
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(100%);
  }
`;

const sidebarHideAnimation = keyframes`
  0% {
    transform: translateX(100%);
  }

  99% {
    transform: translateX(0);
  }

  100% {
    visibility: hidden;
    transform: translateX(0);
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsBar = styled.div`
  overflow: visible;
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;
  margin-top: 0;
  padding: 0;
  position: sticky;
  width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${backgroundColor};
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  z-index: 1;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  margin-left: -${searchResultsBarDesktopWidth}rem;
  animation: ${sidebarOpenAnimation} ${sidebarTransitionTime}ms forwards;
  ${(props: {searchResultsOpen: boolean}) => !props.searchResultsOpen && css`
    animation: ${sidebarHideAnimation} ${sidebarTransitionTime}ms forwards;
  `}
  ${theme.breakpoints.mobile(css`
    margin-left: -100%;
    width: 100%;
    margin-top: 0;
    top: ${searchSidebarTopOffset}rem;
    padding: 0;
  `)}

  > ${NavOl} {
    ::before {
      display: none;
    }

    margin: 0;
    padding: 0;
  }

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  line-height: 1.3;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: ${theme.color.neutral.base};
  min-height: ${headerHeight}rem;
`;

// tslint:disable-next-line:variable-name
export const SummaryTitle = styled.span`
  ${labelStyle}
  font-weight: bold;
  padding-right: ${theme.padding.page.desktop}rem;
  line-height: 1.3;
`;

// tslint:disable-next-line:variable-name
export const Details = styled(BaseDetails)`
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummaryContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${backgroundColor};
  padding: 1rem 0 1rem ${theme.padding.page.desktop}rem;
  border-top: solid 0.1rem ${borderColor};
  ${theme.breakpoints.mobile(css`
    padding-left: ${theme.padding.page.mobile}rem;

    ${SummaryTitle} {
      padding-right: ${theme.padding.page.mobile}rem;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchBarSummary = styled(Summary)`
  min-height: 3.8rem;

  > * {
    outline: none;
  }
`;

// tslint:disable-next-line:variable-name
export const SearchResultsLink = styled.div`
  ${labelStyle}
  width: 100%;
  font-weight: 500;
  line-height: 1.3;
`;

// tslint:disable-next-line:variable-name
export const SectionContentPreview = styled(ContentLinkComponent)`
  ${labelStyle}
  cursor: pointer;
  margin-left: 6.6rem;
  min-height: 3.7rem;
  align-items: center;
  margin-right: ${theme.padding.page.mobile}rem;
  padding: 1.2rem 0;
  display: block;
  text-decoration: none;
  line-height: 1.3;

  :not(:last-child) {
    border-bottom: solid 0.1rem ${backgroundColor};
  }

  em {
    font-weight: bold;
  }

  ${theme.breakpoints.mobile(css`
    margin-left: 5rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LinkWrapper = styled.div`
  min-height: 3.4rem;
  display: flex;
  align-items: center;
  padding-left: 4.3rem;
  padding-top: 1.2rem;
  padding-bottom: 0.8rem;
  border-top: solid 0.2rem ${backgroundColor};
  ${theme.breakpoints.mobile(css`
    padding-left: 3.3rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const DetailsOl = styled.ol`
  overflow: visible;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
export const NavItem = styled.li`
  overflow: visible;
  background: ${theme.color.primary.gray.foreground};
`;

// tslint:disable-next-line:variable-name
export const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: center;
  margin-top: 7rem;
  margin-left: auto;
  margin-right: auto;
`;

// tslint:disable-next-line:variable-name
export const CloseIconButton = styled.button`
  ${toolbarIconStyles}
  cursor: pointer;
  border: none;
  padding: 0;
  margin: 0.3rem; /* some space to show focus outline */
  background: transparent;
  overflow: visible;
  height: ${headerHeight - 0.3}rem;
  width: ${headerHeight - 0.3}rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1.4rem 1.4rem 0 0;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}

  ${CloseIconButton} {
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${backgroundColor};
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
export const HeaderQuery = styled.div`
  flex: 1;
  padding: 1rem 0;
  align-self: center;
`;

// tslint:disable-next-line:variable-name
export const ListItem = styled.li`
  overflow: visible;
  display: block;
`;
