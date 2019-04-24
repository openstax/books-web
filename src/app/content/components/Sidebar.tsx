import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import Times from '../../components/Times';
import { textStyle } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { resetToc } from '../actions';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page, State } from '../types';
import { splitTitleParts } from '../utils/archiveTreeUtils';
import { scrollTocSectionIntoView } from '../utils/domUtils';
import { stripIdVersion } from '../utils/idUtils';
import {
  bookBannerDesktopHeight,
  bookBannerMobileHeight,
  sidebarDesktopWidth,
  sidebarMobileWidth,
  sidebarTransitionTime,
  toolbarDesktopHeight,
  toolbarMobileHeight
} from './constants';
import ContentLinkComponent from './ContentLink';
import { CloseSidebarControl, ToCButtonText } from './SidebarControl';
import { toolbarIconStyles } from './Toolbar';
import { styleWhenSidebarClosed } from './utils/sidebar';

const sidebarPadding = 1.8;
const numberCharacterWidth = 0.8;
const numberPeriodWidth = 0.1;
const iconPadding = 0.7;
const iconSize = 1.5;

const sidebarClosedStyle = css`
  overflow-y: hidden;
  transform: translateX(-${sidebarDesktopWidth}rem);
  box-shadow: none;
  background-color: transparent;
  ${theme.breakpoints.mobile(css`
    transform: translateX(-${sidebarMobileWidth}rem);
  `)}

  > * {
    visibility: hidden;
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
const SidebarBody = styled.div<{isOpen: State['tocOpen']}>`
  position: sticky;
  top: ${bookBannerDesktopHeight}rem;
  margin-top: -${toolbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopHeight}rem);
  transition:
    transform ${sidebarTransitionTime}ms,
    box-shadow ${sidebarTransitionTime}ms,
    background-color ${sidebarTransitionTime}ms;
  background-color: ${theme.color.neutral.darker};
  z-index: 3; /* stay above book content and overlay */
  margin-left: -50vw;
  padding-left: 50vw;
  width: calc(50vw + ${sidebarDesktopWidth}rem);
  min-width: calc(50vw + ${sidebarDesktopWidth}rem);
  box-shadow: 0.2rem 0 0.2rem 0 rgba(0, 0, 0, 0.1);
  ${theme.breakpoints.mobile(css`
    width: calc(50vw + ${sidebarMobileWidth}rem);
    min-width: calc(50vw + ${sidebarMobileWidth}rem);
    margin-top: -${toolbarMobileHeight}rem;
    top: ${bookBannerMobileHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileHeight}rem);
  `)}

  display: flex;
  flex-direction: column;

  > ol {
    -webkit-overflow-scrolling: touch;
    position: relative;
    padding: ${sidebarPadding}rem ${sidebarPadding}rem ${sidebarPadding}rem 0.2rem;
    flex: 1;
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    visibility: visible;
    opacity: 1;
  }

  ${styleWhenSidebarClosed(sidebarClosedStyle)}
`;

// tslint:disable-next-line:variable-name
const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${toolbarDesktopHeight}rem;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  margin-right: 0;
  padding-right: 0;
`;

// tslint:disable-next-line:variable-name
const SidebarHeaderButton = styled((props) => <CloseSidebarControl {...props} />)`
  display: flex;
  margin-right: ${sidebarPadding}rem;
  flex: 1;

  ${ToCButtonText} {
    flex: 1;
    text-align: left;
  }

  ${ToCHeader} {
    flex: 1;
    text-align: left;
  }
`;

// tslint:disable-next-line:variable-name
const NavItemComponent: ComponentType<{active?: boolean, className?: string}> = React.forwardRef(
  ({active, className, children}, ref) => <li
    ref={ref}
    className={className}
    {...(active ? {'aria-label': 'Current Page'} : {})}
  >{children}</li>
);

// tslint:disable-next-line:variable-name
const NavItem = styled(NavItemComponent)`
  ${textStyle}
  list-style: none;
  font-size: 1.4rem;
  line-height: 1.6rem;
  overflow: visible;

  :active,
  :hover,
  :focus,
  :visited {
    ${textStyle}
  }

  &[aria-label="Current Page"] a {
    font-weight: bold;
  }
`;

const expandCollapseIconStyle = css`
  height: ${iconSize}rem;
  width: ${iconSize}rem;
  margin-right: ${iconPadding}rem;
`;

// tslint:disable-next-line:variable-name
const ExpandIcon = styled(CaretRight)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
const CollapseIcon = styled(CaretDown)`
  ${expandCollapseIconStyle}
`;

// tslint:disable-next-line:variable-name
const SummaryTitle = styled.span`
  font-size: 1.4rem;
  line-height: 1.6rem;
  font-weight: normal;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  display: flex;
  list-style: none;
  cursor: pointer;

  &::-webkit-details-marker {
    display: none;
  }
`;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, {title}) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }

  const numbers = num.replace(/[^0-9]/, '');
  const periods = num.replace(/[^\.]/, '');

  return Math.max(result, numbers.length * numberCharacterWidth + periods.length * numberPeriodWidth);
}, 0);

// tslint:disable-next-line:variable-name
const ContentLink = styled(ContentLinkComponent)`
  display: flex;
  margin-left: ${iconPadding + iconSize}rem;
`;

// tslint:disable-next-line:variable-name
const NavOl = styled.ol<{contents: ArchiveTree['contents']}>`
  margin: 0;
  padding: 1.2rem 3rem 0 0;

  ${NavItem} {
    margin: 0 0 1.5rem 0;

    a {
      ${textStyle}
      text-decoration: none;
    }
  }

  .os-number,
  .os-divider,
  .os-text {
    display: inline-block;
    overflow: hidden;
  }

  ${SummaryTitle} {
    display: flex;
  }

  ${(props) => {
    const numberWidth = getNumberWidth(props.contents);

    return css`
      .os-number {
        width: ${numberWidth}rem;
      }

      .os-divider {
        text-align: center;
        width: 0.8rem;
      }

      .os-text {
        flex: 1;
      }

      ol {
        margin-left: ${numberWidth + 0.5}rem;
      }
    `;
  }}
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  border: none;
  overflow: visible;

  &[open] ${ExpandIcon} {
    display: none;
  }

  &:not([open]) ${CollapseIcon} {
    display: none;
  }

  ${NavItem} {
    margin-bottom: 1.2rem;

    :first-child {
      margin-top: 1.5rem;
    }
  }
`;

interface SidebarProps {
  onNavigate: () => void;
  isOpen: State['tocOpen'];
  book?: Book;
  page?: Page;
}

export class Sidebar extends Component<SidebarProps> {
  public sidebar: HTMLElement | undefined;
  public activeSection: HTMLElement | undefined;
  public container: Element | undefined | null;

  public render() {
    const {isOpen, book} = this.props;
    return <SidebarBody isOpen={isOpen} ref={(ref: any) => this.sidebar = ref} aria-label='Table of Contents'>
      {this.renderTocHeader()}
      {book && this.renderToc(book)}
    </SidebarBody>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();
    this.expandCurrentChapter();

    const sidebar = this.sidebar;

    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandler = () => {
      const top = sidebar.getBoundingClientRect().top;
      sidebar.style.setProperty('height', `calc(100vh - ${top}px)`);
    };

    const animation = () => requestAnimationFrame(scrollHandler);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
  }

  public componentDidUpdate() {
    this.scrollToSelectedPage();
    this.expandCurrentChapter();
  }

  private scrollToSelectedPage() {
    scrollTocSectionIntoView(this.sidebar, this.activeSection);
  }

  private expandCurrentChapter() {

    if (typeof(document) === 'undefined' || typeof(window) === 'undefined') {
      return;
    }

    const currentChapter: HTMLElement = document.querySelector('[aria-label="Current Page"]') as HTMLElement;

    if ( currentChapter
      && currentChapter.parentElement
      && currentChapter.parentElement.parentElement
      && !currentChapter.parentElement.parentElement.hasAttribute('open')) {
        currentChapter.parentElement.parentElement.setAttribute('open', '');
    }

  }

  private renderChildren = (book: Book, {contents}: ArchiveTree) =>
    <NavOl contents={contents}>
        {contents.map((item) => {
          const active = (!!this.props.page) && stripIdVersion(item.id) === this.props.page.id;

          return isArchiveTree(item)
            ? <NavItem>{this.renderTocNode(book, item)}</NavItem>
            :
                <NavItem
                  key={item.id}
                  ref={active ? ((ref: any) => this.activeSection = ref) : undefined}
                  active={active}
                >
                  <ContentLink
                    onClick={this.props.onNavigate}
                    book={book}
                    page={item}
                    dangerouslySetInnerHTML={{__html: item.title}}
                  />
                </NavItem>;
        })}
    </NavOl>

  private renderTocNode = (book: Book, node: ArchiveTree) =>
  <Details ref={(ref: any) => this.container = ref}>
      <Summary>
        <ExpandIcon/>
        <CollapseIcon/>
        <SummaryTitle dangerouslySetInnerHTML={{__html: node.title}}/>
      </Summary>
      {this.renderChildren(book, node)}
  </Details>

  private renderTocHeader = () => <ToCHeader>
    <SidebarHeaderButton><TimesIcon /></SidebarHeaderButton>
  </ToCHeader>

  private renderToc = (book: Book) => this.renderChildren(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    onNavigate: () => dispatch(resetToc()),
  })
)(Sidebar);
