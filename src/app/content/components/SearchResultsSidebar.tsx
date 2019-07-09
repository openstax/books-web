import { SearchResultHit } from '@openstax/open-search-client/dist/models/SearchResultHit';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { Details, iconSize } from '../../components/Details';
import { labelStyle, textRegularLineHeight, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { clearSearch } from '../search/actions';
import { isSearchResultChapter } from '../search/guards';
import * as selectSearch from '../search/selectors';
import { SearchResultChapter, SearchResultContainer, SearchResultPage } from '../search/types';
import Loader from './../../components/Loader';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  mobileSearchContainerMargin,
  searchResultsBarDesktopWidth,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarSearchInputMobileHeight,
} from './constants';
import { CollapseIcon, ExpandIcon, SidebarBody, Summary, SummaryTitle, SummaryWrapper } from './Sidebar/styled';
import { toolbarIconStyles } from './Toolbar';

const searchResultsBarVariables = {
    backgroundColor: '#f1f1f1',
    mainPaddingDesktop: 3,
    mainPaddingMobile: 2,
};

// tslint:disable-next-line:variable-name
const SearchIconInsideBar = styled(Search)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.darker};
  margin-right: 0.7rem;
  margin-left: 3rem;
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled(Times)`
  ${toolbarIconStyles}
  color: ${theme.color.primary.gray.lighter};
  margin-right: 1.4rem;
`;

// tslint:disable-next-line:variable-name
const NavOl = styled.ol`
`;

// tslint:disable-next-line:variable-name
const SearchResultsBar = styled(SidebarBody)`
  top: calc(${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem);
  margin-top: 0;
  padding: 0;
  margin-left: -${sidebarDesktopWidth}rem;
  width: ${searchResultsBarDesktopWidth}rem;
  min-width: ${searchResultsBarDesktopWidth}rem;
  background-color: ${searchResultsBarVariables.backgroundColor};

  ${theme.breakpoints.mobile(css`
    width: 100%;
    min-width: 100%;
    margin-top: 0;
    top: ${bookBannerMobileMiniHeight + toolbarMobileHeight
          + toolbarSearchInputMobileHeight + (mobileSearchContainerMargin * 2)}rem;
    margin-left: -${sidebarMobileWidth}rem;
    padding: 0;
  `)}

  > ${NavOl} {
    margin: 0;
    padding: 0;
  }

`;

// tslint:disable-next-line:variable-name
const SearchQuery = styled.div`
  ${textRegularStyle}
  display: flex;
  align-items: center;
  justify-content: end;
  min-height: 4rem;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  background: ${theme.color.neutral.base};
  padding: 1rem 0;
`;

// tslint:disable-next-line:variable-name
const SearchBarSummary = styled(Summary)`
    min-height: 3.8rem;
    display: flex;
    align-items: center;
    background: ${searchResultsBarVariables.backgroundColor};
    border-top: solid 0.1rem #d5d5d5;
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop}rem;
`;

// tslint:disable-next-line:variable-name
const SearchResultsLink = styled.a`
  ${labelStyle}
  text-decoration: none;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const SectionContentPreview = styled.div`
  ${labelStyle}
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize + 2.3}rem;
    min-height: 3.7rem;
    align-items: center;
    padding-right: 1.6rem;
    margin: 1rem 0;
`;

// tslint:disable-next-line:variable-name
const LinkWrapper = styled.div`
    min-height: 3.4rem;
    display: flex;
    align-items: center;
    padding-left: ${searchResultsBarVariables.mainPaddingDesktop + iconSize}rem;
`;

// tslint:disable-next-line:variable-name
const DetailsOl = styled.ol`
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const NavItem = styled.li`
  background: ${theme.color.primary.gray.foreground};
  :not(:last-child) {
    border-bottom: solid 0.2rem ${searchResultsBarVariables.backgroundColor};
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryAlignment = styled.div`
  max-width: 26.5rem;
  text-align: justify;
  /*textRegularLineHeight is the close icon height*/
  margin-top: calc(7rem - ${textRegularLineHeight}rem);
  margin-left: auto;
  margin-right: auto;
`;

// tslint:disable-next-line:variable-name
const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// tslint:disable-next-line:variable-name
const LoadingWrapper = styled.div`
  overflow: hidden;
  right: 0;
  top: 0;
  position: absolute;
  transition: opacity 0.2s;
  width: 100%;
  height: 100%;
  background-color: ${searchResultsBarVariables.backgroundColor};
  z-index: 5;
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
const CloseIconButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
`;

// tslint:disable-next-line:variable-name
const SearchResultContainers = (props: {containers: SearchResultContainer[]}) => <React.Fragment>
  {props.containers.map((node: SearchResultContainer) => isSearchResultChapter(node)
    ? <SearchResultsDropdown chapter={node} key={node.id} />
    : <SearchResult page={node} key={node.id} />
  )}
</React.Fragment>;

// tslint:disable-next-line:variable-name
const SearchResult = (props: {page: SearchResultPage}) => <NavItem>
  <LinkWrapper>
    <SearchResultsLink href='#' dangerouslySetInnerHTML={{__html: props.page.title}} />
  </LinkWrapper>
  {props.page.results.map((hit: SearchResultHit) =>
    hit.highlight && hit.highlight.visibleContent
      ? hit.highlight.visibleContent.map((highlight: string) =>
          <SectionContentPreview dangerouslySetInnerHTML={{__html: highlight}} />
        )
      : []
  )}
</NavItem>;

// tslint:disable-next-line:variable-name
const SearchResultsDropdown = (props: {chapter: SearchResultChapter}) => <li>
  <Details>
    <SearchBarSummary>
      <SummaryWrapper>
        <ExpandIcon/>
        <CollapseIcon/>
        <SummaryTitle dangerouslySetInnerHTML={{__html: props.chapter.title}} />
      </SummaryWrapper>
    </SearchBarSummary>
    <DetailsOl>
      <SearchResultContainers containers={props.chapter.contents} />
    </DetailsOl>
  </Details>
</li>;

interface SearchResultsSidebarProps {
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
}

// tslint:disable-next-line:variable-name
const SearchResultsSidebar = ({query, totalHits, results, onClose}: SearchResultsSidebarProps) => !query
  ? null
  : <SearchResultsBar>
      {!results && <LoadingWrapper>
        <Loader/>
      </LoadingWrapper>}
      {totalHits && totalHits > 0 && <SearchQueryWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:results'>
          {(msg: Element | string) =>
            <SearchQuery>
              <SearchIconInsideBar />
              <div>
                {results ? totalHits : 0 } {msg} <strong> &lsquo;{query}&rsquo;</strong>
              </div>
            </SearchQuery>
          }
        </FormattedMessage>
        <CloseIconButton onClick={onClose}><CloseIcon /></CloseIconButton>
      </SearchQueryWrapper>}
      {results && totalHits && totalHits === 0 && <div>
        <CloseIconWrapper>
          <CloseIconButton onClick={onClose}><CloseIcon /></CloseIconButton>
        </CloseIconWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:no-results'>
          {(msg: Element | string) =>
            <SearchQuery>
              <SearchQueryAlignment>{msg} <strong> &lsquo;{query}&rsquo;</strong></SearchQueryAlignment>
            </SearchQuery>
          }
        </FormattedMessage>
      </div>}
      {results && totalHits && totalHits > 0 && <NavOl>
        <SearchResultContainers containers={results} />
      </NavOl>}
    </SearchResultsBar>;

export default connect(
  (state: AppState) => ({
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
