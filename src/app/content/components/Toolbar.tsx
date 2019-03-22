import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components';
import { ListOl } from 'styled-icons/fa-solid/ListOl';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { maxNavWidth } from '../../components/NavBar';
import { contentFont, textRegularLineHeight, textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { assertString } from '../../utils';
import SidebarControl from './SidebarControl';

const iconColor = '#5E6062';

export const toolbarDesktopHeight = 5;
export const toolbarMobileHeight = 4;

export const iconStyles = css`
  height: 1.6rem;
  width: 1.6rem;
  margin-right: 0.5rem;
  color: ${iconColor};
`;

// tslint:disable-next-line:variable-name
const SearchIcon = styled(Search)`
  ${iconStyles};
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${iconStyles};
`;

// tslint:disable-next-line:variable-name
const ListIcon = styled(ListOl)`
  ${iconStyles};
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.h3`
  font-family: ${contentFont};
  ${textRegularSize};
  color: ${iconColor};
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButtonWrapper = styled(SidebarControl)`
  border: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: none;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  height: ${toolbarDesktopHeight}rem;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 4rem;
  border-bottom: solid 0.1rem ${iconColor};
  ${theme.breakpoints.mobile(css`
    border: none;
    margin-right: 1rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInput = styled.input`
  ${textRegularStyle}
  color: ${theme.color.text.default};
  height: ${textRegularLineHeight}rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${iconColor};
  }

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const PrintOptWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.h3`
  ${textRegularStyle};
  color: ${iconColor};
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchPrintWrapper = styled.div`
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const BarWrapper = styled.div`
  width: 100%;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
  position: relative;  /* to make the drop shadow show over the content */
  z-index: 2;  /* to make the drop shadow show over the sidebar */
  display: block;
  background: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const Toolbar: SFC = () => <BarWrapper>
  <TopBar>
    <ToCButtonWrapper>
      <ListIcon/><ToCButton>Table of contents</ToCButton>
    </ToCButtonWrapper>
    <SearchPrintWrapper>
      <FormattedMessage id='i18n:toolbar:search:placeholder'>
        {(msg: Element | string) => <SearchInputWrapper>
          <SearchIcon /><SearchInput placeholder={assertString(msg, 'placeholder must be a string')}></SearchInput>
        </SearchInputWrapper>}
      </FormattedMessage>
      <FormattedMessage id='i18n:toolbar:print:text'>
        {(msg: Element | string) => <PrintOptWrapper><PrintIcon /><PrintOptions>{msg}</PrintOptions></PrintOptWrapper>}
      </FormattedMessage>
    </SearchPrintWrapper>
  </TopBar>
</BarWrapper>;

export default Toolbar;
