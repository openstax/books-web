import { SearchResultHit } from '@openstax/open-search-client';
import isEqual from 'lodash/fp/isEqual';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { CollapseIcon, ExpandIcon } from '../../../../components/Details';
import { AppState, Dispatch, FirstArgumentType } from '../../../../types';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { closeSearchResultsMobile, selectSearchResult } from '../../actions';
import { isSearchResultChapter } from '../../guards';
import { SearchResultChapter, SearchResultContainer, SearchResultPage, SelectedResult } from '../../types';
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
  const active = props.page && props.currentPage
    && stripIdVersion(props.currentPage.id) === stripIdVersion(props.page.id);

  return <Styled.NavItem>
    <FormattedMessage id='i18n:search-results:bar:current-page'>
      {(msg: Element | string) =>
        <Styled.LinkWrapper {...(active ? {'aria-label': msg} : {})}>
          <Styled.SearchResultsLink
            dangerouslySetInnerHTML={{ __html: props.page.title }}
          />
        </Styled.LinkWrapper>
      }
    </FormattedMessage>
    {props.page.results.map((hit: SearchResultHit) =>
      hit.highlight.visibleContent.map((highlight: string, index: number) => {
        const thisResult = {result: hit, highlight: index};
        const isSelected = isEqual(props.selectedResult, thisResult);
        return <Styled.SectionContentPreview
          selectedResult={isSelected}
          data-testid='search-result'
          key={index}
          book={props.book}
          page={props.page}
          search={{selectedResult: thisResult}}
          onClick={() => props.selectResult(thisResult)}
          {...isSelected ?  {ref: props.activeSectionRef} : {}}
        >
          <div tabIndex={-1} dangerouslySetInnerHTML={{ __html: highlight }} />
        </Styled.SectionContentPreview>;
      })
    )}
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
