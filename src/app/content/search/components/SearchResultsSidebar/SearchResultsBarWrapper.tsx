import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Loader from '../../../../components/Loader';
import { Book } from '../../../types';
import {
  scrollSidebarSectionIntoView,
  setSidebarHeight
} from '../../../utils/domUtils';
import { SearchResultContainer, SelectedResult } from '../../types';
import SearchResultContainers from './SearchResultContainers';
import * as Styled from './styled';

interface ResultsSidebarProps {
  query: string | null;
  hasQuery: boolean;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
  book?: Book;
  totalHits: number | null;
  selectedResult: SelectedResult | null;
}

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public loadindState = () => <FormattedMessage id='i18n:search-results:bar:loading-state'>
    {(msg: Element | string) => <Styled.LoadingWrapper aria-label={msg}>
      <Styled.CloseIconWrapper>
        <Styled.CloseIconButton onClick={this.props.onClose}>
          <Styled.CloseIcon />
        </Styled.CloseIconButton>
      </Styled.CloseIconWrapper>
      <Loader />
    </Styled.LoadingWrapper>}
  </FormattedMessage>;

  public totalResults = () => <Styled.SearchQueryWrapper ref={this.searchSidebarHeader}>
    <Styled.SearchQuery>
      <Styled.SearchIconInsideBar />
        <Styled.HeaderQuery>
          {this.props.totalHits}{' '}
          <FormattedMessage
            id='i18n:search-results:bar:query:results'
            values={{total: this.props.totalHits}}/>
          <strong> &lsquo;{this.props.query}&rsquo;</strong>
        </Styled.HeaderQuery>
        <Styled.CloseIconButton
          onClick={this.props.onClose}
          data-testid='close-search'
        >
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.SearchQuery>
  </Styled.SearchQueryWrapper>;

  public noResults = () => <div>
    <Styled.CloseIconWrapper>
      <Styled.CloseIconButton onClick={this.props.onClose}>
        <Styled.CloseIcon />
      </Styled.CloseIconButton>
    </Styled.CloseIconWrapper>
    <FormattedMessage id='i18n:search-results:bar:query:no-results'>
      {(msg: Element | string) => (
        <Styled.SearchQuery>
          <Styled.SearchQueryAlignment>
            {msg} <strong> &lsquo;{this.props.query}&rsquo;</strong>
          </Styled.SearchQueryAlignment>
        </Styled.SearchQuery>
      )}
    </FormattedMessage>
  </div>;

  public resultContainers = (book: Book, results: SearchResultContainer[]) => <Styled.NavOl>
    <SearchResultContainers
      activeSectionRef={this.activeSection}
      selectedResult={this.props.selectedResult}
      containers={results}
      book={book}
    />
  </Styled.NavOl>;

  public render() {
    const { results, book, searchResultsOpen, hasQuery } = this.props;

    return (
      <FormattedMessage id='i18n:search-results:bar'>
        {(msg: Element | string) => (
          <Styled.SearchResultsBar
            aria-label={msg}
            searchResultsOpen={searchResultsOpen}
            hasQuery={hasQuery}
            ref={this.searchSidebar}
            data-testid='search-results-sidebar'
          >
            {!results ? this.loadindState() : null}
            {results && results.length > 0 ? this.totalResults() : null}
            {results && results.length === 0 ? this.noResults() : null}
            {book && results && results.length > 0 ? this.resultContainers(book, results) : null}
          </Styled.SearchResultsBar>
        )}
      </FormattedMessage>
    );
  }

  public componentDidMount = () => {
    this.scrollToSelectedPage();
    const searchSidebar = this.searchSidebar.current;

    if (!searchSidebar || typeof window === 'undefined') {
      return;
    }

    const {callback, deregister} = setSidebarHeight(searchSidebar, window);
    callback();
    this.deregister = deregister;
  };

  public componentDidUpdate() {
    this.scrollToSelectedPage();
  }

  public componentWillUnmount() {
    this.deregister();
  }
  private deregister: () => void = () => null;

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(
      this.searchSidebar.current,
      this.activeSection.current
    );
  }
}
