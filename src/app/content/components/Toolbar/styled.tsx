import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { AngleLeft } from 'styled-icons/fa-solid/AngleLeft';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import { maxNavWidth } from '../../../components/NavBar/styled';
import {
  contentFont,
  decoratedLinkStyle,
  textRegularLineHeight,
  textRegularSize,
  textRegularStyle,
  textStyle
} from '../../../components/Typography';
import theme from '../../../theme';
import { assertString } from '../../../utils';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  mobileSearchContainerMargin,
  toolbalHrHeight,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight,
  toolbarSearchInputHeight,
  toolbarSearchInputMobileHeight
} from '../constants';
import { disablePrint } from '../utils/disablePrint';

export const toolbarIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
  padding: 0.4rem;
`;

const hideSearchChrome = css`
  appearance: textfield;

  ::-webkit-search-decoration,
  ::-webkit-search-cancel-button,
  ::-webkit-search-results-button,
  ::-webkit-search-results-decoration {
    appearance: none;
    display: none;
  }
`;

const closeIconStyles = css`
  height: 1.6rem;
  width: 1.6rem;
  color: #cdcdcd;
`;

const barPadding = css`
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  width: calc(100% - ${theme.padding.page.desktop}rem * 2);
  ${theme.breakpoints.mobile(css`
    width: calc(100% - ${theme.padding.page.mobile}rem * 2);
  `)}
`;

// tslint:disable-next-line:variable-name
const PlainButton = styled.button`
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  align-items: center;
  color: ${toolbarIconColor.base};
  height: 100%;
  min-width: 45px;

  :hover,
  :focus {
    outline: none;
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
export const PrintOptWrapper = styled(PlainButton)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
export const PrintOptions = styled.span`
  font-weight: 600;
  font-family: ${contentFont};
  ${textRegularSize};
  margin: 0 0 0 0.5rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
`;
// tslint:disable-next-line:variable-name
export const SearchButton = styled(({ desktop, mobile, ...props }) => <PlainButton {...props}><Search /></PlainButton>)`
  > svg {
    ${toolbarIconStyles}
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
  ${(props) => props.mobile && css`
    display: none;
    ${theme.breakpoints.mobile(css`
      display: block;
    `)}
  `}
`;

// tslint:disable-next-line:variable-name
export const CloseButton = styled(({ desktop, ...props }) => <PlainButton {...props}><TimesCircle /></PlainButton>)`
  > svg {
    ${closeIconStyles}
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchInputWrapper = styled.form`
  display: flex;
  align-items: center;
  margin-right: 2rem;
  position: relative;
  color: ${toolbarIconColor.base};
  border: solid 0.1rem;
  border-radius: 0.2rem;
  width: 38rem;

  &:focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  &.focus-within {
    border: solid 0.1rem ${theme.color.secondary.lightBlue.base};
    box-shadow: 0 0 4px 0 rgba(13, 192, 220, 0.5);
  }

  ${theme.breakpoints.mobile(css`
    margin-right: 0;
    height: 100%;
    overflow: hidden;
    width: 100%;

    ${(props: { active: boolean }) => props.active && css`
      background: ${theme.color.primary.gray.base};

      ${SearchButton} {
        color: ${theme.color.primary.gray.foreground};
      }
    `}
  `)}
`;

// tslint:disable-next-line:variable-name
export const SearchInput = styled(({desktop, mobile, ...props}) =>
  <FormattedMessage id='i18n:toolbar:search:placeholder'>
    {(msg) => <input {...props}
      aria-label={assertString(msg, 'placeholder must be a string')}
      placeholder={assertString(msg, 'placeholder must be a string')}
    />}
  </FormattedMessage>)`
    ${textStyle}
    ${hideSearchChrome}
    font-size: 1.6rem;
    margin: 0 1rem 0 1rem;
    height: ${toolbarSearchInputHeight}rem;
    border: none;
    outline: none;
    width: 100%;
    appearance: textfield;

    ::placeholder {
      color: ${theme.color.text.label};
    }

    ${(props) => props.desktop && theme.breakpoints.mobile(css`
      display: none;
    `)}
  `;

// tslint:disable-next-line:variable-name
export const SearchPrintWrapper = styled.div`
  height: 100%;
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: 100%;
    ${SearchInputWrapper} {
      border: none;
      border-radius: 0;
    }
  `)}
`;

const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;

// tslint:disable-next-line:variable-name
export const BarWrapper = styled.div`
  position: sticky;
  top: ${bookBannerDesktopMiniHeight}rem;
  width: 100%;
  overflow: visible;
  display: block;
  z-index: 2; /* stay above book content */
  background-color: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    top: ${bookBannerMobileMiniHeight}rem;
  `)}

  ${shadow}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const Hr = styled.hr`
  border: none;
  border-top: ${toolbalHrHeight}rem solid #efeff1;
  display: none;
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  overflow: visible;
  align-items: center;
  ${barPadding};
  height: ${toolbarDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
export const MobileSearchContainer = styled.div`
  ${barPadding}
  margin-top: ${mobileSearchContainerMargin}rem;
  margin-bottom: ${mobileSearchContainerMargin}rem;
  height: ${toolbarSearchInputMobileHeight}rem;
  ${theme.breakpoints.mobile(css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `)}
`;

// tslint:disable-next-line:variable-name
export const MobileSearchWrapper = styled.div`
  display: none;
  height: ${toolbarMobileSearchWrapperHeight}rem;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
export const LeftArrow = styled(AngleLeft)`
  width: 2.5rem;
  height: 2.5rem;
`;

// tslint:disable-next-line:variable-name
export const ToggleSeachResultsText = styled.a`
  ${textRegularStyle}
  ${decoratedLinkStyle}
  display: flex;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const InnerText = styled.div`
  white-space: nowrap;
  margin-right: 1rem;
  text-align: left;
`;
