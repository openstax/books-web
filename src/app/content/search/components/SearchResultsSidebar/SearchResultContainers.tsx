import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { CollapseIcon, ExpandIcon } from '../../../../components/Details';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { setCurrentExcerpt } from '../../actions';
import { isSearchResultChapter } from '../../guards';
import * as selectSearch from '../../selectors';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../../types';
import * as Styled from './styled';

interface SearchResultContainersProps {
  currentPage: Page | undefined;
  containers: SearchResultContainer[];
  book: Book;
  closeSearchResults: () => void;
  activeSectionRef: HTMLElement;
  currentExcerpt: string | null;
  setCurrentExcerpt: (highlight: string) => void;
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
          closeSearchResults={props.closeSearchResults}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
          currentExcerpt={props.currentExcerpt}
          setCurrentExcerpt={props.setCurrentExcerpt}
        />
      ) : (
        <SearchResult
          currentPage={props.currentPage}
          page={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
          activeSectionRef={props.activeSectionRef}
          key={node.id}
          currentExcerpt={props.currentExcerpt}
          setCurrentExcerpt={props.setCurrentExcerpt}
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
  closeSearchResults: () => void;
  activeSectionRef: HTMLElement;
  currentExcerpt: string | null;
  setCurrentExcerpt: (highlight: string) => void;
}) => {
  const active = props.page && props.currentPage
    && stripIdVersion(props.currentPage.id) === stripIdVersion(props.page.id);
  return <Styled.NavItem ref={active ? props.activeSectionRef : null }>
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
      hit.source && hit.highlight && hit.highlight.visibleContent
      ? hit.highlight.visibleContent.map((highlight: string, index: number) => {
        return <Styled.ExcerptWrapper onClick={() => {props.closeSearchResults();
                                                      props.setCurrentExcerpt(highlight); }}>
          <Styled.SectionContentPreview
            data-testid='search-result'
            key={index}
            book={props.book}
            page={props.page}
            {...((highlight === props.currentExcerpt) ? {currentExcerpt: true} : {})}
          >
            <span tabIndex={-1} dangerouslySetInnerHTML={{ __html: highlight }}></span>
          </Styled.SectionContentPreview>
        </Styled.ExcerptWrapper>;
      }) : []
    )}
  </Styled.NavItem>;
};

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {
  currentPage: Page | undefined;
  chapter: SearchResultChapter;
  book: Book;
  closeSearchResults: () => void;
  activeSectionRef: HTMLElement;
  currentExcerpt: string | null;
  setCurrentExcerpt: (highlight: string) => void;
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
          closeSearchResults={props.closeSearchResults}
          activeSectionRef={props.activeSectionRef}
          currentExcerpt={props.currentExcerpt}
          setCurrentExcerpt={props.setCurrentExcerpt}
        />
      </Styled.DetailsOl>
    </Styled.Details>
  </Styled.ListItem>;
};

export default connect(
  (state: AppState) => ({
    currentExcerpt: selectSearch.getCurrentExcerpt(state),
    currentPage: select.page(state),
  }),
  (dispatch: Dispatch) => ({
    setCurrentExcerpt: (highlight: string) => {
      dispatch(setCurrentExcerpt(highlight));
    },
  })
)(SearchResultContainers);
