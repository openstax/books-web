import { HTMLInputElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument, assertString } from '../../../utils';
import {
  clearSearch,
  openMobileToolbar,
  openSearchResultsMobile,
  requestSearch,
} from '../../search/actions';
import * as selectSearch from '../../search/selectors';
import NudgeStudyTools from '../NudgeStudyTools';
import PrintButton from './PrintButton';
import * as Styled from './styled';
import { NudgeBackground } from '../NudgeStudyTools/styles';

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
  queryProp: string;
  formSubmitted: boolean;
}

class Toolbar extends React.Component<Props, State> {

  public static getDerivedStateFromProps(newProps: Props, state: State) {
    if (newProps.query && newProps.query !== state.queryProp && newProps.query !== state.query) {
      return {...state, query: newProps.query, queryProp: newProps.query};
    }
    return {...state, queryProp: newProps.query};
  }

  public state = { query: '', queryProp: '', formSubmitted: false };

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

    const showBackToSearchResults = !this.props.searchSidebarOpen && this.props.hasSearchResults;

    return <Styled.BarWrapper data-analytics-region='toolbar'>
      <Styled.TopBar data-testid='toolbar'>
        <Styled.SidebarControl hideMobileText={true} />
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
        </Styled.SearchPrintWrapper>
        <NudgeStudyTools />
        <PrintButton />
        <NudgeBackground />
      </Styled.TopBar>
      {this.props.mobileToolbarOpen && <Styled.MobileSearchWrapper>
        <Styled.Hr />
        <Styled.MobileSearchContainer>
          {showBackToSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:toggle-text:mobile'>
              {(msg) => <Styled.SeachResultsTextButton onClick={openSearchbar} data-testid='back-to-search-results'>
                <Styled.LeftArrow/><Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.SeachResultsTextButton>}
            </FormattedMessage>}
          {!showBackToSearchResults &&
            <FormattedMessage id='i18n:search-results:bar:close-text:mobile'>
              {(msg) => <Styled.SeachResultsTextButton onClick={toggleMobile} data-testid='close-search-results'>
                <Styled.InnerText>{msg}</Styled.InnerText>
              </Styled.SeachResultsTextButton>}
            </FormattedMessage>}
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
