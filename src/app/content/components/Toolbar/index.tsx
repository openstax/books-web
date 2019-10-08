import { HTMLInputElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument, assertString } from '../../../utils';
import { clearSearch, openMobileToolbar, openSearchResultsMobile, requestSearch } from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import { OpenSidebarControl } from '../SidebarControl';
import PrintButton from './PrintButton';
import * as Styled from './styled';

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

    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
      this.setState({ query: e.currentTarget.value, formSubmitted: false });
    };

    return <Styled.BarWrapper>
      <Styled.TopBar data-testid='toolbar'>
        <OpenSidebarControl />
        <Styled.SearchPrintWrapper>
          <Styled.SearchInputWrapper
            active={this.props.mobileToolbarOpen}
            onSubmit={onSubmit}
            data-testid='desktop-search'
          >
            <Styled.SearchInput desktop type='search' data-testid='desktop-search-input'
              onChange={onChange}
              value={this.state.query}/>
            <FormattedMessage id='i18n:toolbar:search:toggle'>
              {(msg) => <FormattedMessage id='i18n:search-results:bar:search-icon:value'>
                {(val) => <Styled.SearchButton mobile
                type='button'
                aria-label={assertString(msg, 'button name must be a string')}
                data-testid='mobile-toggle'
                onClick={toggleMobile}
                value={val}
              />}</FormattedMessage>}
            </FormattedMessage>
            {!this.state.formSubmitted && <FormattedMessage id='i18n:search-results:bar:search-icon:value'>
                {(val) => <Styled.SearchButton desktop value={val} />}
              </FormattedMessage>
            }
            {this.state.formSubmitted &&
              <Styled.CloseButton desktop type='button' onClick={onClear} data-testid='desktop-clear-search' />
            }
          </Styled.SearchInputWrapper>
          <PrintButton/>
        </Styled.SearchPrintWrapper>
      </Styled.TopBar>
      {this.props.mobileToolbarOpen && <Styled.MobileSearchWrapper>
        <Styled.Hr />
        <Styled.MobileSearchContainer>
          {!this.props.searchSidebarOpen && this.props.hasSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
              {(msg) => <Styled.ToggleSeachResultsText onClick={openSearchbar} data-testid='back-to-search-results'>
                <Styled.LeftArrow/><Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.ToggleSeachResultsText>}
            </FormattedMessage>
          }
          <Styled.SearchInputWrapper action='#' onSubmit={onSubmit} data-testid='mobile-search'>
            <Styled.SearchInput mobile type='search' data-testid='mobile-search-input'
              autoFocus
              onChange={onChange} value={this.state.query} />
            {this.state.query && <Styled.CloseButton
              type='button'
              onClick={onClear}
              data-testid='mobile-clear-search'
            />}
          </Styled.SearchInputWrapper>
        </Styled.MobileSearchContainer>
      </Styled.MobileSearchWrapper>}
    </Styled.BarWrapper>;
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
