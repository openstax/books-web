import { HTMLInputElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { AngleLeft } from 'styled-icons/fa-solid/AngleLeft';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import { maxNavWidth } from '../../components/NavBar';
import {
  contentFont,
  labelStyle,
  linkColor,
  textRegularLineHeight,
  textRegularSize,
  textRegularStyle
} from '../../components/Typography';
import { isHtmlElement } from '../../guards';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { assertDocument, assertString, assertWindow } from '../../utils';
import { clearSearch, openMobileToolbar, openSearchResultsMobile, requestSearch } from '../search/actions';
import * as selectSearch from '../search/selectors';
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
  toolbarSearchInputMobileHeight,
} from './constants';
import { OpenSidebarControl } from './SidebarControl';
import { disablePrint } from './utils/disablePrint';

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
const PrintOptWrapper = styled(PlainButton)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const PrintOptions = styled.span`
  font-weight: 600;
  font-family: ${contentFont};
  ${textRegularSize};
  margin: 0 0 0 0.5rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const PrintIcon = styled(Print)`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const SearchButton = styled(({ desktop, mobile, ...props }) => <PlainButton {...props}><Search /></PlainButton>)`
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
const CloseButton = styled(({ desktop, ...props }) => <PlainButton {...props}><TimesCircle /></PlainButton>)`
  > svg {
    ${closeIconStyles}
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInputWrapper = styled.form`
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

  &.ally-focus-within {
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
const SearchInput = styled(({ desktop, mobile, ...props }) => <FormattedMessage id='i18n:toolbar:search:placeholder'>
  {(msg) => <input {...props}
    aria-label={assertString(msg, 'placeholder must be a string')}
    placeholder={assertString(msg, 'placeholder must be a string')}
  />}
</FormattedMessage>)`
  ${labelStyle}
  ${hideSearchChrome}
  line-height: 2;
  margin: 0 1rem 0 1rem;
  height: ${toolbarSearchInputHeight}rem;
  border: none;
  outline: none;
  width: 100%;
  appearance: textfield;

  ::placeholder {
    ${labelStyle}
    color: ${theme.color.text.label};
    line-height: inherit;
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchPrintWrapper = styled.div`
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
const BarWrapper = styled.div`
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
const Hr = styled.hr`
  border: none;
  border-top: ${toolbalHrHeight}rem solid #efeff1;
  display: none;
  margin: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
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
const MobileSearchContainer = styled.div`
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
const MobileSearchWrapper = styled.div`
  display: none;
  height: ${toolbarMobileSearchWrapperHeight}rem;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(AngleLeft)`
  width: 2.5rem;
  height: 2.5rem;
`;

// tslint:disable-next-line:variable-name
const ToggleSeachResultsText = styled.button`
  ${textRegularStyle}
  margin: 0;
  padding: 0;
  color: ${linkColor};
  display: flex;
  align-items: center;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const InnerText = styled.div`
  white-space: nowrap;
  margin-right: 1rem;
  text-align: left;
`;

interface Props {
  search: typeof requestSearch;
  query: string | null;
  clearSearch: () => void;
  openSearchResults: () => void;
  openMobileToolbar: () => void;
  mobileToolbarOpen: boolean;
  searchSidebarOpen: boolean;
  hasSearchResults: boolean;
}

interface State {
  query: string;
  formSubmitted: boolean;
}

class Toolbar extends React.Component<Props, State> {
  public state = { query: '', formSubmitted: false };

  public componentWillUpdate(newProps: Props) {
    if (newProps.query && newProps.query !== this.props.query && newProps.query !== this.state.query) {
      this.setState({query: newProps.query});
    }
  }

  public render() {
    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const activeElement = assertDocument().activeElement;
      if (this.state.query) {
        if (isHtmlElement(activeElement)) {
          activeElement.blur();
        }
        this.props.search(this.state.query);
        this.setState({ formSubmitted: true });
      }
    };

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({ query: e.currentTarget.value, formSubmitted: false });
    };

    const onClear = (e: React.FormEvent) => {
      e.preventDefault();
      this.setState({ query: '', formSubmitted: false });
    };

    const toggleMobile = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (this.props.mobileToolbarOpen) {
        this.props.clearSearch();
      } else {
        this.props.openMobileToolbar();
      }
    };

    const openSearchbar = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      this.props.openSearchResults();
    };

    return <BarWrapper>
      <TopBar data-testid='toolbar'>
        <OpenSidebarControl />
        <SearchPrintWrapper>
          <SearchInputWrapper active={this.props.mobileToolbarOpen} onSubmit={onSubmit} data-testid='desktop-search'>
            <SearchInput desktop type='search' data-testid='desktop-search-input'
              onChange={onChange} value={this.state.query} />
            <FormattedMessage id='i18n:toolbar:search:toggle'>
              {(msg) => <FormattedMessage id='i18n:search-results:bar:search-icon:value'>
                {(val) => <SearchButton mobile
                type='button'
                aria-label={assertString(msg, 'button name must be a string')}
                data-testid='mobile-toggle'
                onClick={toggleMobile}
                value={val}
              />}</FormattedMessage>}
            </FormattedMessage>
            {!this.state.formSubmitted && <FormattedMessage id='i18n:search-results:bar:search-icon:value'>
                {(val) => <SearchButton desktop value={val}/>}
              </FormattedMessage>
            }
            {this.state.formSubmitted &&
              <CloseButton desktop type='button' onClick={onClear} data-testid='desktop-clear-search' />
            }
          </SearchInputWrapper>
          <FormattedMessage id='i18n:toolbar:print:text'>
            {(msg: Element | string) => <FormattedMessage id='i18n:toolbar:print:aria-label'>
              {(label: Element | string) =>
                <PrintOptWrapper
                  onClick={() => assertWindow().print()}
                  aria-label={label}
                  data-testid='print'
                >
                  <PrintIcon /><PrintOptions>{msg}</PrintOptions>
                </PrintOptWrapper>
              }</FormattedMessage>
            }
          </FormattedMessage>
        </SearchPrintWrapper>
      </TopBar>
      {this.props.mobileToolbarOpen && <MobileSearchWrapper>
        <Hr />
        <MobileSearchContainer>
          {!this.props.searchSidebarOpen && this.props.hasSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
              {(msg) => <ToggleSeachResultsText onClick={openSearchbar} data-testid='back-to-search-results'>
                <LeftArrow/><InnerText>{msg}</InnerText>
              </ToggleSeachResultsText>}
            </FormattedMessage>
          }
          <SearchInputWrapper action='#' onSubmit={onSubmit} data-testid='mobile-search'>
            <SearchInput mobile type='search' data-testid='mobile-search-input'
              onChange={onChange} value={this.state.query} />
            {this.state.query && <CloseButton type='button' onClick={onClear} data-testid='mobile-clear-search' />}
          </SearchInputWrapper>
        </MobileSearchContainer>
      </MobileSearchWrapper>}
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    hasSearchResults: selectSearch.hasResults(state),
    mobileToolbarOpen: selectSearch.mobileToolbarOpen(state),
    query: selectSearch.query(state),
    searchSidebarOpen: selectSearch.searchResultsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    clearSearch: flow(clearSearch, dispatch),
    openMobileToolbar: flow(openMobileToolbar, dispatch),
    openSearchResults: flow(openSearchResultsMobile, dispatch),
    search: flow(requestSearch, dispatch),
  })
)(Toolbar);
