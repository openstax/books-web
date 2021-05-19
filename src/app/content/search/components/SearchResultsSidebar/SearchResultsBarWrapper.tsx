import { SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Loader from '../../../../components/Loader';
import { assertNotNull } from '../../../../utils/assertions';
import { Book } from '../../../types';
import {
  fixSafariScrolling,
  scrollSidebarSectionIntoView,
  setSidebarHeight
} from '../../../utils/domUtils';
import { SearchResultContainer, SelectedResult } from '../../types';
import RelatedKeyTerms from './RelatedKeyTerms';
import SearchResultContainers from './SearchResultContainers';
import * as Styled from './styled';

interface ResultsSidebarProps {
  query: string | null;
  hasQuery: boolean;
  keyTermHits: SearchResultHit[] | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
  book?: Book;
  totalHits: number | null;
  totalHitsKeyTerms: number | null;
  selectedResult: SelectedResult | null;
}

// tslint:disable-next-line: variable-name
const LoadingState = ({onClose}: {onClose: () => void}) => <Styled.LoadingWrapper
  aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar:loading-state'})}
>
  <Styled.CloseIconWrapper>
    <Styled.CloseIconButton onClick={onClose}>
      <Styled.CloseIcon />
    </Styled.CloseIconButton>
  </Styled.CloseIconWrapper>
  <Loader />
</Styled.LoadingWrapper>;

// tslint:disable-next-line: variable-name
const SearchResultsBar = React.forwardRef<
  HTMLElement, {searchResultsOpen: boolean, hasQuery: boolean, children: React.ReactNode}
>(
  (props, ref) => <Styled.SearchResultsBar
    aria-label={useIntl().formatMessage({id: 'i18n:search-results:bar'})}
    data-testid='search-results-sidebar'
    ref={ref}
    {...props}
  />
);

export class SearchResultsBarWrapper extends Component<ResultsSidebarProps> {

  public searchSidebar = React.createRef<HTMLElement>();
  public activeSection = React.createRef<HTMLElement>();
  public searchSidebarHeader = React.createRef<HTMLElement>();

  public totalResults = () => <Styled.SearchQueryWrapper ref={this.searchSidebarHeader}>
    <Styled.SearchQuery>
      <Styled.SearchIconInsideBar />
        <Styled.HeaderQuery>
          <FormattedMessage
            id='i18n:search-results:bar:query:results'
            values={{search: this.props.totalHits, terms: this.props.totalHitsKeyTerms}}
          />
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
      {(msg) => (
        <Styled.SearchQuery>
          <Styled.SearchQueryAlignment>
            {msg} <strong> &lsquo;{this.props.query}&rsquo;</strong>
          </Styled.SearchQueryAlignment>
        </Styled.SearchQuery>
      )}
    </FormattedMessage>
  </div>;

  public resultContainers = (book: Book, results: SearchResultContainer[] | null) => {
    const displayRelatedKeyTerms = this.props.keyTermHits && this.props.keyTermHits.length > 0;
    const displaySearchResults = results && results.length > 0;
    const displaySearchResultsSectionTitle = displayRelatedKeyTerms && displaySearchResults;

    if (!displayRelatedKeyTerms && !displaySearchResults) { return null; }

    return <Styled.NavOl>
      {displayRelatedKeyTerms && <RelatedKeyTerms
        book={book}
        keyTermHits={assertNotNull(this.props.keyTermHits, 'displayRelatedKeyTerms is true')}
      />}
      {displaySearchResultsSectionTitle && <Styled.SearchResultsSectionTitle>
        <FormattedMessage id='i18n:search-results:bar:title'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.SearchResultsSectionTitle>}
      {displaySearchResults && <SearchResultContainers
        activeSectionRef={this.activeSection}
        selectedResult={this.props.selectedResult}
        containers={assertNotNull(results, 'displaySearchResults is true')}
        book={book}
      />}
    </Styled.NavOl>;
  };

  public render() {
    const { results, book, searchResultsOpen, hasQuery, totalHitsKeyTerms } = this.props;

    return (
      <SearchResultsBar
        searchResultsOpen={searchResultsOpen}
        hasQuery={hasQuery}
        ref={this.searchSidebar}
      >
        {!results ? <LoadingState onClose={this.props.onClose} /> : null}
        {results && results.length > 0 ? this.totalResults() : null}
        {results && results.length === 0 && totalHitsKeyTerms === 0 ? this.noResults() : null}
        {book && (results || totalHitsKeyTerms) ? this.resultContainers(book, results) : null}
      </SearchResultsBar>
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

    searchSidebar.addEventListener('webkitAnimationEnd', fixSafariScrolling);
  };

  public componentDidUpdate() {
    this.scrollToSelectedPage();
  }

  public componentWillUnmount() {
    const searchSidebar = this.searchSidebar.current;
    this.deregister();

    if (!searchSidebar || typeof window === 'undefined') {
      return;
    }
    searchSidebar.removeEventListener('webkitAnimationEnd', fixSafariScrolling);

  }
  private deregister: () => void = () => null;

  private scrollToSelectedPage() {
    scrollSidebarSectionIntoView(
      this.searchSidebar.current,
      this.activeSection.current
    );
  }
}
