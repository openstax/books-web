import { SearchResult } from '@openstax/open-search-client/dist/models/SearchResult';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Search } from 'styled-icons/fa-solid/Search';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { Details, iconSize } from '../../components/Details';
import { labelStyle, textRegularLineHeight, textRegularStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState } from '../../types';
import * as selectSearch from '../search/selectors';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  mobileSearchContainerMargin,
  searchResultsBarDesktopWidth,
  searchResultsBarMobileWidth,
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
  margin-left: calc(-50vw - ${sidebarDesktopWidth}rem);
  padding-left: 50vw;
  width: calc(50vw + ${searchResultsBarDesktopWidth}rem);
  min-width: calc(50vw + ${searchResultsBarDesktopWidth}rem);
  background-color: ${searchResultsBarVariables.backgroundColor};

  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${searchResultsBarMobileWidth}vw);
    min-width: calc(50vw + ${searchResultsBarMobileWidth}vw);
    top: ${bookBannerMobileMiniHeight + toolbarMobileHeight
          + toolbarSearchInputMobileHeight + (mobileSearchContainerMargin * 2)}rem;
    margin-left: calc(-50vw - ${sidebarMobileWidth}rem);
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
  justify-content: center;
  min-height: 4rem;

  strong {
    padding-left: 0.4rem;
  }
`;

// tslint:disable-next-line:variable-name
const SearchQueryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    display: flex;
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
`;

// tslint:disable-next-line:variable-name
const CloseIconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// tslint:disable-next-line:variable-name
const LoadingWrapper = styled.div`
  background-color: #f1f1f1;
  bottom: 0;
  height: 100vh;
  left: 0;
  opacity: 1;
  overflow: hidden;
  -webkit-perspective: 100rem;
  perspective: 100rem;
  position: fixed;
  right: 0;
  top: 0;
  -webkit-transition: opacity 0.2s;
  -o-transition: opacity 0.2s;
  transition: opacity 0.2s;
  width: 100vw;
  z-index: 200;
  transition: opacity 0.5s 0.3s, transform 0.2s 0.2s;
`;

// tslint:disable-next-line:variable-name
const InnerLoaderOverlay = styled.div`
  height: 10rem;
  left: 50%;
  margin-left: -5rem;
  margin-top: -5rem;
  position: absolute;
  top: 50%;
  width: 10rem;
`;

const yellowBar = styled.path`

`;

// tslint:disable-next-line:variable-name
const SearchResultsSidebar = ({query, results}: {query: string | null, results: SearchResult | null}) =>
  <SearchResultsBar open={query ? true : false }>
    <LoadingWrapper>
      <InnerLoaderOverlay>
        <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 57.6 39.1" style="enable-background:new 0 0 57.6 39.1;" xml:space="preserve"><path id="os-blue" class="os-blue" style="fill: #00246a;" d="M38.4,22c0,0.4-0.3,0.7-0.7,0.7H13.5c-0.4,0-0.7-0.3-0.7-0.7v-1.4c0-0.4,0.3-0.7,0.7-0.7h24.2 c0.4,0,0.7,0.3,0.7,0.7V22z"/> 
          <path id="os-yellow" class="os-yellow" style="fill: #f4d019;" d="M41.8,17.8c0,0.4-0.3,0.7-0.7,0.7l-25.4,0.8c-0.4,0-0.7-0.3-0.7-0.7l-0.1-2.1 c0-0.4,0.3-0.7,0.7-0.7L41,15c0.4,0,0.7,0.3,0.7,0.7L41.8,17.8z"/> 
          <path id="os-gray" class="os-gray" style="fill: #5e6062;" d="M34.8,14c0,0.4-0.3,0.7-0.7,0.7H11.6c-0.4,0-0.7-0.3-0.7-0.7v-3.5c0-0.4,0.3-0.7,0.7-0.7h22.5 c0.4,0,0.7,0.3,0.7,0.7V14z"/> 
          <path id="os-orange" class="os-orange" style="fill: #f47641;" d="M39,8.1c0,0.3-0.4,0.5-1,0.5H8.6c-0.5,0-1-0.2-1-0.5V6.9c0-0.3,0.4-0.5,1-0.5H38 c0.5,0,1,0.2,1,0.5V8.1z"/> 
          <path id="os-green" class="os-green" style="fill: #77af42;" d="M43.9,5c0,0.7-0.6,1.2-1.2,1.1L15,4.8c-0.7,0-1.2-0.6-1.1-1.2L14,1.1c0-0.7,0.6-1.2,1.2-1.1 l27.7,1.3c0.7,0,1.2,0.6,1.1,1.2L43.9,5z"/> 
          <path id="os-type" class="os-type" style="fill: #5e6062;" d="M3.1,30.2c-1.8,0-3.1,1.3-3.1,3.1c0,1.8,1.3,3.1,3.1,3.1c1.8,0,3.1-1.3,3.1-3.1 C6.2,31.5,4.9,30.2,3.1,30.2z M3.1,35.7c-1.4,0-2.3-1.1-2.3-2.4c0-1.3,0.9-2.4,2.3-2.4c1.4,0,2.3,1.1,2.3,2.4 C5.4,34.6,4.5,35.7,3.1,35.7z M10.9,30.2c-0.9,0-1.9,0.4-2.4,1.2h0v-1H7.7v8.8h0.8v-3.9h0C9,36,10,36.4,10.9,36.4 c1.8,0,3.1-1.3,3.1-3.1C14,31.5,12.7,30.2,10.9,30.2z M10.9,35.7c-1.4,0-2.5-1.1-2.5-2.4c0-1.3,1.1-2.4,2.5-2.4 c1.4,0,2.3,1.1,2.3,2.4C13.2,34.6,12.3,35.7,10.9,35.7z M18.3,30.2c-1.7,0-2.9,1.3-2.9,3.1c0,1.8,1.2,3.1,3,3.1c1,0,2-0.4,2.6-1.3 l-0.6-0.5c-0.4,0.6-1.2,1-2,1c-1.8,0-2.2-1.6-2.2-2.2h5v-0.5C21.1,31.6,20.1,30.2,18.3,30.2z M16.1,32.8c0-0.3,0.5-1.9,2.1-1.9 c1.1,0,2,0.9,2,1.9H16.1z M27.9,32.7v3.5h-0.8v-3.5c0-1-0.3-1.9-1.5-1.9c-1.1,0-2,0.8-2,2.4v2.9h-0.8V32c0-0.4-0.1-1.4-0.1-1.7h0.8 c0,0.4,0,0.9,0.1,1h0c0.3-0.7,1.1-1.2,2-1.2C27.4,30.2,27.9,31.4,27.9,32.7z M34.2,34.4c0,1.5-1.4,2-2.6,2c-0.9,0-1.8-0.2-2.4-0.9 l1-1c0.4,0.4,0.8,0.8,1.5,0.8c0.4,0,1-0.2,1-0.7c0-1.3-3.3-0.3-3.3-2.6c0-1.4,1.2-2,2.5-2c0.8,0,1.7,0.3,2.2,0.9l-1,0.9 c-0.3-0.4-0.7-0.6-1.2-0.6c-0.4,0-0.9,0.2-0.9,0.7C30.9,32.9,34.2,32,34.2,34.4z M37.5,30.1h1.7v1.3h-1.7v2.7c0,0.6,0.2,1,0.9,1 c0.3,0,0.6-0.1,0.8-0.2v1.3c-0.3,0.2-0.9,0.2-1.2,0.2c-1.6,0-2-0.7-2-2.2v-2.8h-1.3v-1.3H36v-1.8h1.5V30.1z M43,30 c-1,0-1.9,0.3-2.6,1l0.8,0.8c0.4-0.4,1-0.6,1.6-0.6c0.8,0,1.4,0.4,1.4,1.1v0.2h-0.4c-1.5,0-3.9,0.1-3.9,2.1c0,1.2,1.1,1.8,2.2,1.8 c0.8,0,1.5-0.3,2-1h0v0.8h1.4v-3.5C45.6,31.8,45.6,30,43,30z M44.1,33.8c0,0.9-0.5,1.4-1.5,1.4c-0.5,0-1.1-0.2-1.1-0.8 c0-0.9,1.5-0.9,2.3-0.9h0.3V33.8z M50.8,32.9l2.5,3.3h-1.9L49.8,34l-1.6,2.2h-1.8l2.5-3.3l-2.1-2.8h1.9l1.2,1.8l1.3-1.8h1.7 L50.8,32.9z M57.6,30.1v1.7h-0.3v-1.5h0l-0.6,1.5h-0.2l-0.6-1.5h0v1.5h-0.3v-1.7h0.4l0.5,1.3l0.5-1.3H57.6z M53.9,30.1h1.4v0.3h-0.5 v1.5h-0.3v-1.5h-0.5V30.1z"/>
        </svg>
      </InnerLoaderOverlay>
    </LoadingWrapper>
      {results && results.hits.total > 0 && <SearchQueryWrapper>
        <FormattedMessage id='i18n:search-results:bar:query:results'>
          {(msg: Element | string) =>
            <SearchQuery>
              <SearchIconInsideBar />
              <div>
                {results ? results.hits.total : 0 } {msg} <strong> &lsquo;{query}&rsquo;</strong>
              </div>
            </SearchQuery>
          }
        </FormattedMessage>
        <CloseIcon />
      </SearchQueryWrapper>}

        {results && results.hits.total === 0 && <div>
          <CloseIconWrapper><CloseIcon/></CloseIconWrapper>
          <FormattedMessage id='i18n:search-results:bar:query:no-results'>
            {(msg: Element | string) =>
              <SearchQuery>
                <SearchQueryAlignment>{msg} <strong> &lsquo;{query}&rsquo;</strong></SearchQueryAlignment>
              </SearchQuery>
            }
          </FormattedMessage>
        </div>}
      {results && results.hits.total > 0 && <NavOl>
        <li>
            <Details>
                <SearchBarSummary>
                    <SummaryWrapper>
                        <ExpandIcon/>
                        <CollapseIcon/>
                        <SummaryTitle>
                            <span className='os-number'>1</span><span className='os-divider'> </span>
                            <span className='os-text'>Science and the universe: A Brief Tour</span>
                        </SummaryTitle>
                    </SummaryWrapper>
                </SearchBarSummary>
                <DetailsOl>
                    <NavItem>
                        <LinkWrapper>
                            <SearchResultsLink href='#'>
                                <span className='os-number'>1.1</span><span className='os-divider'> </span>
                                <span className='os-text'>Section title</span>
                            </SearchResultsLink>
                        </LinkWrapper>
                        <SectionContentPreview>
                            died because of a cosmic collision. a tiny moon
                            whose gravity is so weak that one good throw of a cosmic
                        </SectionContentPreview>
                    </NavItem>
                    <NavItem>
                        <LinkWrapper>
                            <SearchResultsLink href='#'>
                                <span className='os-number'>1.2</span><span className='os-divider'> </span>
                                <span className='os-text'>Chemistry in Context</span>
                            </SearchResultsLink>
                        </LinkWrapper>
                    </NavItem>
                </DetailsOl>
            </Details>
        </li>
        <li>
            <Details>
                <SearchBarSummary>
                    <SummaryWrapper>
                        <ExpandIcon/>
                        <CollapseIcon/>
                        <SummaryTitle>
                            <span className='os-number'>2</span><span className='os-divider'> </span>
                            <span className='os-text'>Observing the sky: The Birth of Astronomy</span>
                        </SummaryTitle>
                    </SummaryWrapper>
                </SearchBarSummary>
                <DetailsOl>
                    <NavItem>
                        <LinkWrapper>
                            <SearchResultsLink href='#'>
                                <span className='os-number'>2.1</span><span className='os-divider'> </span>
                                <span className='os-text'>A Tour of the Universe</span>
                            </SearchResultsLink>
                        </LinkWrapper>
                        <SectionContentPreview>
                            died because of a cosmic collision. a tiny moon
                            whose gravity is so weak that one good throw of a cosmic
                        </SectionContentPreview>
                    </NavItem>
                </DetailsOl>
            </Details>
        </li>
    </NavOl>}
</SearchResultsBar>;

export default connect(
  (state: AppState) => ({
    query: selectSearch.query(state),
    results: selectSearch.results(state),
  })
)(SearchResultsSidebar);
