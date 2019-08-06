import { HTMLInputElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Print } from 'styled-icons/fa-solid/Print';
import { Search } from 'styled-icons/fa-solid/Search';
import { TimesCircle } from 'styled-icons/fa-solid/TimesCircle';
import { maxNavWidth } from '../../components/NavBar';
import { contentFont, textRegularLineHeight, textRegularSize, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { assertString, assertWindow } from '../../utils';
import { requestSearch } from '../search/actions';
import * as selectSearch from '../search/selectors';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarIconColor,
  toolbarMobileHeight
} from './constants';
import { OpenSidebarControl } from './SidebarControl';
import { disablePrint } from './utils/disablePrint';

export const toolbarIconStyles = css`
  height: ${textRegularLineHeight}rem;
  width: ${textRegularLineHeight}rem;
  padding: 0.4rem;
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
const SearchButton = styled(({desktop, mobile, ...props}) => <PlainButton {...props}><Search /></PlainButton>)`
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
const CloseButton = styled(({desktop, ...props}) => <PlainButton {...props}><TimesCircle /></PlainButton>)`
  > svg {
    ${toolbarIconStyles}
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

  &:focus-within {
    border: solid 0.1rem #0cc0dc;
  }

  &.ally-focus-within {
    border: solid 0.1rem #0cc0dc;
  }

  ${theme.breakpoints.mobile(css`
    margin-right: 0;
    height: 100%;

    ${(props: {active: boolean}) => props.active && css`
      background: ${theme.color.primary.gray.base};

      ${SearchButton} {
        color: ${theme.color.primary.gray.foreground};
      }
    `}
  `)}
`;

// tslint:disable-next-line:variable-name
const SearchInput = styled(({desktop, mobile, ...props}) => <FormattedMessage id='i18n:toolbar:search:placeholder'>
  {(msg) => <input {...props}
    aria-label={assertString(msg, 'placeholder must be a string')}
    placeholder={assertString(msg, 'placeholder must be a string')}
  />}
</FormattedMessage>)`
  ${textRegularStyle}
  color: ${theme.color.text.default};
  line-height: 3.2rem;
  margin: 0 1rem 0 1rem;
  height: 3.2rem;
  border: none;
  outline: none;

  ::placeholder {
    color: ${toolbarIconColor.base};
  }

  ${(props) => props.desktop && theme.breakpoints.mobile(css`
    display: none;
  `)}
  ${(props) => props.mobile && css`
    width: 100%;
  `}
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
  height: ${toolbarDesktopHeight}rem;
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
    top: ${bookBannerMobileMiniHeight}rem;
  `)}

  ${shadow}
  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const Hr = styled.hr`
  border: none;
  border-top: 0.1rem solid #efeff1;
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
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

// tslint:disable-next-line:variable-name
const MobileSearchWrapper = styled.div`
  display: none;
  background-color: ${theme.color.neutral.base};
  ${shadow}
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

class Toolbar extends React.Component<{
  search: typeof requestSearch, query: string | null}, {query: string, mobileOpen: boolean, formSubmitted: boolean
}> {
  public state = {query: '', mobileOpen: false, formSubmitted: false};

  public render() {
    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (this.state.query) {
        this.props.search(this.state.query);
        this.setState({formSubmitted: true});
      }
    };

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({query: e.currentTarget.value, formSubmitted: false});
    };

    const onClear = (e: React.FormEvent) => {
      e.preventDefault();
      this.setState({query: '', formSubmitted: false});
    };

    const toggleMobile = (e: React.FormEvent) => {
      e.preventDefault();
      this.setState({mobileOpen: !this.state.mobileOpen});
    };

    return <BarWrapper>
      <TopBar data-testid='toolbar'>
        <OpenSidebarControl />
        <SearchPrintWrapper>
          <SearchInputWrapper active={this.state.mobileOpen} onSubmit={onSubmit} data-testid='desktop-search'>
            <SearchInput desktop data-testid='desktop-search-input' onChange={onChange} value={this.state.query} />
            <FormattedMessage id='i18n:toolbar:search:toggle'>
              {(msg) => <SearchButton mobile
                type='button'
                aria-label={assertString(msg, 'button name must be a string')}
                data-testid='mobile-toggle'
                onClick={toggleMobile}
              />}
            </FormattedMessage>
            {!this.state.formSubmitted && <SearchButton desktop />}
            {this.state.formSubmitted &&
              <CloseButton desktop onClick={onClear} data-testid='desktop-clear-search' />
            }
          </SearchInputWrapper>
          <FormattedMessage id='i18n:toolbar:print:text'>
            {(msg: Element | string) =>
              <PrintOptWrapper
                aria-label='print'
                onClick={() => assertWindow().print()}
                data-testid='print'
              >
                <PrintIcon /><PrintOptions>{msg}</PrintOptions>
              </PrintOptWrapper>
            }
          </FormattedMessage>
        </SearchPrintWrapper>
      </TopBar>
      {this.state.mobileOpen && <MobileSearchWrapper>
        <Hr />
        <MobileSearchContainer>
          <SearchInputWrapper onSubmit={onSubmit} data-testid='mobile-search'>
            <SearchInput mobile data-testid='mobile-search-input' onChange={onChange} value={this.state.query} />
            {!this.state.formSubmitted && <SearchButton />}
            {this.state.formSubmitted && <CloseButton onClick={onClear} data-testid='mobile-clear-search' />}
          </SearchInputWrapper>
        </MobileSearchContainer>
      </MobileSearchWrapper>}
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    query: selectSearch.query(state),
  }),
  (dispatch: Dispatch) => ({
    search: (query: string) => dispatch(requestSearch(query)),
  })
)(Toolbar);
