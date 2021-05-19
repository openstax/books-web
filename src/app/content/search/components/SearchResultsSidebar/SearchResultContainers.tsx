import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { CollapseIcon, ExpandIcon } from '../../../../components/Details';
import { AppState, Dispatch, FirstArgumentType } from '../../../../types';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { closeSearchResultsMobile, selectSearchResult } from '../../actions';
import { isSearchResultChapter } from '../../guards';
import { SearchResultChapter, SearchResultContainer, SearchResultPage, SelectedResult } from '../../types';
import SearchResultHits from './SearchResultHits';
import * as Styled from './styled';

interface SearchResultContainersProps {
  currentPage: Page | undefined;
  containers: SearchResultContainer[];
  book: Book;
  selectedResult: SelectedResult | null;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}
// tslint:disable-next-line:variable-name
const SearchResultContainers = ({containers, ...props}: SearchResultContainersProps) => (
  <React.Fragment>
    {containers.map((node: SearchResultContainer) =>
      isSearchResultChapter(node) ? (
        <SearchResultsDropdown
          currentPage={props.currentPage}
          chapter={node}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
        />
      ) : (
        <SearchResult
          currentPage={props.currentPage}
          page={node}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
        />
      )
    )}
  </React.Fragment>
);

// tslint:disable-next-line:variable-name
const SearchResult = (props: {
  currentPage: Page | undefined;
  page: SearchResultPage;
  book: Book;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  selectedResult: SelectedResult | null;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}) => {
  const formatMessage = useIntl().formatMessage;
  const active = props.page && props.currentPage
    && stripIdVersion(props.currentPage.id) === stripIdVersion(props.page.id);

  return <Styled.NavItem>
    <Styled.LinkWrapper {...(active ? {
      'aria-label': formatMessage({id: 'i18n:search-results:bar:current-page'}),
    } : {})}>
      <Styled.SearchResultsLink
        dangerouslySetInnerHTML={{ __html: props.page.title }}
      />
    </Styled.LinkWrapper>
    <SearchResultHits
      activeSectionRef={props.activeSectionRef}
      book={props.book}
      hits={props.page.results}
      testId='search-result'
      getPage={() => props.page}
      onClick={(result) => props.selectResult(result)}
    />
  </Styled.NavItem>;
};

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {
  currentPage: Page | undefined;
  chapter: SearchResultChapter;
  book: Book;
  selectResult: (payload: FirstArgumentType<typeof selectSearchResult>) => void;
  selectedResult: SelectedResult | null;
  activeSectionRef: React.RefObject<HTMLAnchorElement>;
}) => {
  return <Styled.ListItem>
    <Styled.Details open>
      <Styled.SearchBarSummary tabIndex={0}>
        <Styled.SearchBarSummaryContainer tabIndex={-1}>
          <ExpandIcon />
          <CollapseIcon />
          <Styled.SummaryTitle
            dangerouslySetInnerHTML={{ __html: props.chapter.title }}
          />
        </Styled.SearchBarSummaryContainer>
      </Styled.SearchBarSummary>
      <Styled.DetailsOl>
        <SearchResultContainers
          currentPage={props.currentPage}
          containers={props.chapter.contents}
          book={props.book}
          selectResult={props.selectResult}
          selectedResult={props.selectedResult}
          activeSectionRef={props.activeSectionRef}
        />
      </Styled.DetailsOl>
    </Styled.Details>
  </Styled.ListItem>;
};

export default connect(
  (state: AppState) => ({
    currentPage: select.page(state),
  }),
  (dispatch: Dispatch) => ({
    selectResult: () => {
      dispatch(closeSearchResultsMobile());
    },
  })
)(SearchResultContainers);
