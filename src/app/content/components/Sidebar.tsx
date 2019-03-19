// tslint:disable:variable-name
import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { navDesktopHeight, navMobileHeight } from '../../components/NavBar';
import theme from '../../theme';
import { AppState } from '../../types';
import { isArchiveTree } from '../guards';
import * as selectors from '../selectors';
import { ArchiveTree, Book, Page } from '../types';
import { scrollTocSectionIntoView, stripIdVersion } from '../utils';
import { bookBannerDesktopHeight, bookBannerMobileHeight } from './BookBanner';
import ContentLink from './ContentLink';
import SidebarControl from './SidebarControl';
import { toolbarDesktopHeight, toolbarMobileHeight } from './Toolbar';

export const sidebarWidth = 33.5;

const sidebarTransitionTime = 300;
const sidebarPadding = 1;

const SidebarBody = styled.div<{isOpen: boolean}>`
  top: ${bookBannerDesktopHeight}rem;
  margin-top: -${toolbarDesktopHeight}rem;
  overflow-y: auto;
  height: calc(100vh - ${navDesktopHeight + bookBannerDesktopHeight}rem);
  transition: margin-left ${sidebarTransitionTime}ms,
              background-color ${sidebarTransitionTime}ms;
  background-color: ${theme.color.neutral.darker};
  z-index: 2; /* stay above book content */

  margin-left: -50vw;
  padding-left: 50vw;
  width: calc(50vw + ${sidebarWidth}rem);

  ${theme.breakpoints.mobile(css`
    margin-top: -${toolbarMobileHeight}rem;
    top: ${bookBannerMobileHeight}rem;
    height: calc(100vh - ${navMobileHeight + bookBannerMobileHeight}rem);
  `)}

  ol {
    padding-inline-start: 10px;
  }

  display: flex;
  flex-direction: column;

  > nav {
    padding: ${sidebarPadding}rem;
    flex: 1;
  }

  > * {
    transition: all ${sidebarTransitionTime}ms;
    visibility: visible;
    opacity: 1;
  }

  position: sticky;

  ${(props) => !props.isOpen && css`
    overflow-y: hidden;
    margin-left: calc(-50vw - ${sidebarWidth}rem);
    background-color: transparent;

    > * {
      visibility: hidden;
      opacity: 0;
    }
  `}
`;

const ToCHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${toolbarDesktopHeight}rem;
  overflow: visible;

  ${theme.breakpoints.mobile(css`
    height: ${toolbarMobileHeight}rem;
  `)}
`;

const NavItemComponent: ComponentType<{active?: boolean, className?: string}> = React.forwardRef(
  ({active, className, children}, ref) => <li
    ref={ref}
    className={className}
    {...(active ? {'aria-label': 'Current Page'} : {})}
  >{children}</li>
);

const NavItem = styled(NavItemComponent)`
  list-style: none;
  font-size: 1.4rem;

  ${(props) => props.active && css`
    overflow: visible;
    position: relative;

    :before {
      font-weight: bold;
      content: '>';
      position: absolute;
      right: 100%;
    }
  `}
`;

interface SidebarProps {
  isOpen: boolean;
  book?: Book;
  page?: Page;
}

export class Sidebar extends Component<SidebarProps> {
  public sidebar: HTMLElement | undefined;
  public activeSection: HTMLElement | undefined;

  public render() {
    const {isOpen, book} = this.props;
    return <SidebarBody isOpen={isOpen} ref={(ref: any) => this.sidebar = ref}>
      {this.renderTocHeader()}
      {book && this.renderToc(book)}
    </SidebarBody>;
  }

  public componentDidMount() {
    this.scrollToSelectedPage();

    const sidebar = this.sidebar;

    if (!sidebar || typeof(window) === 'undefined') {
      return;
    }

    const scrollHandler = () => {
      const top = sidebar.getBoundingClientRect().top;
      sidebar.style.height = `calc(100vh - ${top}px`;
    };

    const animation = () => requestAnimationFrame(scrollHandler);

    window.addEventListener('scroll', animation, {passive: true});
    window.addEventListener('resize', animation, {passive: true});
  }

  public componentDidUpdate() {
    this.scrollToSelectedPage();
  }

  private scrollToSelectedPage() {
    if (!this.props.isOpen) {
      return;
    }

    scrollTocSectionIntoView(this.sidebar, this.activeSection);
  }

  private renderTocNode = (book: Book, {contents}: ArchiveTree) => <nav>
    <ol>
      {contents.map((item) => {
        const active = (!!this.props.page) && stripIdVersion(item.id) === this.props.page.id;

        return isArchiveTree(item)
          ? <NavItem key={item.id}>
              <h3 dangerouslySetInnerHTML={{__html: item.title}} />
              {this.renderTocNode(book, item)}
            </NavItem>
          : <NavItem
              key={item.id}
              ref={active ? ((ref: any) => this.activeSection = ref) : undefined}
              active={active}
            >
              <ContentLink book={book} page={item} dangerouslySetInnerHTML={{__html: item.title}} />
            </NavItem>;
      })}
    </ol>
  </nav>

  private renderTocHeader = () => <ToCHeader>
    <SidebarControl />
  </ToCHeader>

  private renderToc = (book: Book) => this.renderTocNode(book, book.tree);
}

export default connect(
  (state: AppState) => ({
    ...selectors.bookAndPage(state),
    isOpen: selectors.tocOpen(state),
  })
)(Sidebar);
