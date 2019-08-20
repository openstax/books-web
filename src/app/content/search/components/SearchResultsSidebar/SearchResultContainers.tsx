import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Details, ExpandIcon } from '../../../../components/Details';
import { AppState } from '../../../../types';
import { CollapseIcon, SummaryTitle, SummaryWrapper } from '../../../components/Sidebar/styled';
import * as select from '../../../selectors';
import { Book, Page } from '../../../types';
import { stripIdVersion } from '../../../utils/idUtils';
import { isSearchResultChapter } from '../../guards';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../../types';
import * as Styled from './styled';

interface SearchResultContainersProps {
  currentPage: Page | undefined;
  containers: SearchResultContainer[];
  book: Book;
  closeSearchResults: () => void;
  activeSectionRef: HTMLElement;
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
        />
      ) : (
        <SearchResult
          currentPage={props.currentPage}
          page={node}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
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
  closeSearchResults: () => void;
  activeSectionRef: HTMLElement;
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
            return<Styled.ExcerptWrapper onClick={props.closeSearchResults}>
              <Styled.SectionContentPreview
              data-testid='search-result'
              key={index}
              book={props.book}
              page={props.page}
              dangerouslySetInnerHTML={{ __html: highlight }}
            /></Styled.ExcerptWrapper>;
          })
        : []
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
}) => {
  return <Styled.ListItem>
    <Details open>
      <Styled.SearchBarSummary>
        <SummaryWrapper>
          <ExpandIcon />
          <CollapseIcon />
          <SummaryTitle
            dangerouslySetInnerHTML={{ __html: props.chapter.title }}
          />
        </SummaryWrapper>
      </Styled.SearchBarSummary>
      <Styled.DetailsOl>
        <SearchResultContainers
          currentPage={props.currentPage}
          containers={props.chapter.contents}
          book={props.book}
          closeSearchResults={props.closeSearchResults}
          activeSectionRef={props.activeSectionRef}
        />
      </Styled.DetailsOl>
    </Details>
  </Styled.ListItem>;
};

export default connect(
  (state: AppState) => ({
    currentPage: select.page(state),
  })
)(SearchResultContainers);
