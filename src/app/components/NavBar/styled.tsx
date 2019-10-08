import Color from 'color';
import React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import { Bars as Hamburger } from 'styled-icons/fa-solid/Bars';
import { ChevronDown } from 'styled-icons/fa-solid/ChevronDown';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import Times from '../Times';
import { contentFont, h4DesktopStyle, linkHover, textRegularStyle } from '../Typography';

export const maxNavWidth = contentWrapperMaxWidth;
export const navDesktopHeight = 6.0;
export const navMobileHeight = 5.2;
const headerImageDesktopHeight = 3.5;
const headerImageMobileHeight = 2.8;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeInAnimation = css`
  animation: ${100}ms ${fadeIn} ease-out;
`;

// tslint:disable-next-line:variable-name
export const TopBar = styled.div`
  overflow: visible;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${navDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  ${theme.breakpoints.mobile(css`
    height: ${navMobileHeight}rem;
  `)}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const HeaderImage = styled.img`
  display: block;
  width: auto;
  height: ${headerImageDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    height: ${headerImageMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const DropdownContainer = styled.div`
  ${fadeInAnimation}
  overflow: visible;
  position: relative;
`;

// tslint:disable-next-line:variable-name
export const OverlayLogo = styled.img`
  display: none;
  width: auto;
  height: ${headerImageMobileHeight}rem;
  position: absolute;
  left: 1.6rem;
  top: ${(navMobileHeight - headerImageMobileHeight) / 2}rem;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

const sharedIconStyles = css`
  margin-left: 1rem;
  height: 1.5rem;
  width: 1.5rem;
`;

// tslint:disable-next-line:variable-name
export const DownIcon = styled(ChevronDown)`
  ${sharedIconStyles}
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const HamburgerIcon = styled(Hamburger)`
  margin-top: 0.1rem;
  ${sharedIconStyles}
  display: none;
  ${theme.breakpoints.mobile(css`
    display: inline;
  `)}
`;

export const navElementStyle = css`
  display: block;
  letter-spacing: -0.072rem;
  font-size: 1.8rem;
  text-decoration: none;
  font-weight: bold;
  padding: 1rem 0;
  font-family: ${contentFont};
  color: ${theme.color.primary.gray.base};

  :hover {
    color: ${theme.color.primary.gray.darker};
  }

  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    letter-spacing: 0.02rem;
    padding: 0.7rem 0;
  `)}
`;

// tslint:disable-next-line:variable-name
export const Link = styled.a`
  :hover,
  :active,
  :focus {
    padding-bottom: 0.6rem;
    border-bottom: 0.4rem solid ${theme.color.primary.green.base};
  }

  ${fadeInAnimation}
  ${navElementStyle}
  ${theme.breakpoints.mobile(css`
    :hover,
    :active,
    :focus {
      padding: 0.7rem 0;
      border-bottom: none;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
export const DropdownToggle = styled.span`
  ${navElementStyle}
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
export const OverlayHeading = styled.h4`
  ${h4DesktopStyle}
  padding-bottom: 0;
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

const visuallyShown = css`
  height: unset;
  width: unset;
  clip: unset;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const DropdownList = styled.ul`
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
  margin: 0;
  padding: 0.6rem 0;
  background: ${theme.color.neutral.base};
  top: calc(100% - 0.4rem);
  right: 0;
  border-top: 0.4rem solid ${theme.color.primary.green.base};

  > li {
    overflow: visible;
    display: block;

    a {
      overflow: visible;
      white-space: nowrap;
      display: block;
      padding: 0 1rem;
      ${textRegularStyle}
      cursor: pointer;
      text-decoration: none;

      :hover {
        color: ${linkHover};
      }
    }
  }

  ${theme.breakpoints.mobile(css`
    position: static;
    box-shadow: none;
    border: none;
    background: none;
  `)}

  ${/* suppress invalid stylelint errors */ css`
    ${DropdownContainer}.focus-within &,
    ${DropdownContainer}:hover & {
      ${visuallyShown}
    }

    ${DropdownContainer}:focus-within & {
      ${visuallyShown}
    }
  `}
`;

const overlayShown = css`
  padding-top: 40%;
  background: ${Color(theme.color.neutral.base).alpha(0.98).string()};
  height: auto;
  width: auto;
  right: 0;
  bottom: -100%;
`;

// tslint:disable-next-line:variable-name
export const DropdownOverlay = styled.div`
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    background: ${Color(theme.color.neutral.base).alpha(0).string()};
    transition: background 200ms;
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 0;
    left: 0;
    height: 0;
    width: 0;
    overflow: hidden;

    &:focus,
    &.focus-within,
    ${DropdownToggle}:focus ~ & {
      ${overlayShown}
    }

    &:focus-within {
      ${overlayShown}
    }

    > div {
      width: min-content;
      overflow: visible;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
export const TimesIcon = styled((props) => <button tabIndex={-1} aria-hidden='true' {...props}><Times /></button>)`
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  position: fixed;
  height: ${navMobileHeight}rem;
  width: ${navMobileHeight}rem;
  top: 0;
  right: 0;
  color: ${theme.color.primary.gray.base};
  display: none;
  ${theme.breakpoints.mobile(css`
    ${DropdownToggle}:focus ~ &,
    ${DropdownOverlay}:focus ~ &,
    ${DropdownOverlay}.focus-within ~ & {
      display: block;
    }
  `)}
`;

// tslint:disable-next-line:variable-name
export const BarWrapper = styled.div`
  overflow: visible;
  z-index: ${theme.zIndex.navbar}; /* above book nav */
  background: ${theme.color.neutral.base};
  position: relative; /* drop shadow above notifications */
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;
