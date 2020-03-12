import { HTMLAnchorElement, HTMLDivElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, h3Style, h4Style, textRegularLineHeight } from '../../components/Typography';
import { notFound } from '../../errors/routes';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertDefined, assertWindow } from '../../utils';
import { hasOSWebData } from '../guards';
import showConfirmation from '../highlights/components/utils/showConfirmation';
import { hasUnsavedHighlight } from '../highlights/selectors';
import * as select from '../selectors';
import { ArchiveTreeSection , Book, BookWithOSWebData } from '../types';
import { isClickWithModifierKeys } from '../utils/domUtils';
import { bookDetailsUrl } from '../utils/urlUtils';
import { defaultTheme } from './constants';
import {
  bookBannerDesktopBigHeight,
  bookBannerDesktopMiniHeight,
  bookBannerMobileBigHeight,
  bookBannerMobileMiniHeight,
  contentTextWidth
} from './constants';
import { disablePrint } from './utils/disablePrint';

const gradients: {[key in BookWithOSWebData['theme']]: string} = {
  'blue': '#004aa2',
  'deep-green': '#12A28C',
  'gray': '#97999b',
  'green': '#9cd14a',
  'light-blue': '#1EE1F0',
  'orange': '#FAA461',
  'red': '#E34361',
  'yellow': '#faea36',
};

const applyBookTextColor = (props: {colorSchema: BookWithOSWebData['theme'] } ) => props.colorSchema && css`
  color: ${theme.color.primary[props.colorSchema].foreground};
`;

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  margin-top: -0.25rem;
  margin-left: -0.8rem;
  height: 3rem;
  width: 3rem;
  ${applyBookTextColor}
`;

export interface PropTypes {
  pageNode?: ArchiveTreeSection;
  book?: Book;
  hasUnsavedHighlight?: boolean;
}

// tslint:disable-next-line:variable-name
const TopBar = styled.div`
  width: 100%;
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
`;

const bookBannerTextStyle = css`
  max-width: ${maxNavWidth - (maxNavWidth - contentTextWidth) / 2}rem;
  padding: 0;
  ${applyBookTextColor}
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

type Style = string | number | FlattenSimpleInterpolation;
const ifMiniNav = (miniStyle: Style, bigStyle?: Style) =>
  (props: {variant: 'mini' | 'big'}) =>
    props.variant === 'mini' ? miniStyle : bigStyle;

const bookTitleMiniNavDestkopWidth = 27;
// tslint:disable-next-line:variable-name
const BookTitle = styled.a`
  ${h4Style}
  ${bookBannerTextStyle}
  display: ${ifMiniNav('inline-block', 'block')};
  height: ${textRegularLineHeight}rem;
  font-weight: normal;
  text-decoration: none;
  margin: 0;

  :hover {
    text-decoration: underline;
  }
  ${theme.breakpoints.mobile(css`
    ${bookBannerTextStyle}
  `)}

  ${ifMiniNav(css`
    width: ${bookTitleMiniNavDestkopWidth}rem;

    ${theme.breakpoints.mobile(css`
      display: none;
    `)}
  `)}
`;

// tslint:disable-next-line:variable-name
const BookChapter = styled(({colorSchema: _, variant, children, ...props}) => variant === 'mini' ?
  <span {...props}>{children}</span> : <h1 {...props}>{children}</h1>)`
  ${ifMiniNav(h4Style, h3Style)}
  ${bookBannerTextStyle}
  font-weight: 600;
  display: ${ifMiniNav('inline-block', 'block')};
  margin: 1rem 0 0 0;
  ${theme.breakpoints.mobile(css`
    ${bookBannerTextStyle}
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    max-height: ${h3MobileLineHeight * 2}rem;
    margin-top: 0.3rem;
  `)}
  ${ifMiniNav(css`
    max-width: ${maxNavWidth - bookTitleMiniNavDestkopWidth - (maxNavWidth - contentTextWidth) / 2}rem;

    ${theme.breakpoints.mobile(css`
      max-width: none;
    `)}
  `)}
`;

interface BarWrapperProps {
  colorSchema: BookWithOSWebData['theme'] | undefined;
  up: boolean;
  variant: 'mini' | 'big';
}
// tslint:disable-next-line:variable-name
export const BarWrapper = styled.div<BarWrapperProps>`
  ${disablePrint}

  top: 0;
  padding: 0 ${theme.padding.page.desktop}rem;
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  height: ${ifMiniNav(bookBannerDesktopMiniHeight, bookBannerDesktopBigHeight)}rem;
  transition: transform 200ms;
  position: ${ifMiniNav('sticky', 'relative' /* stay above mini nav */)};
  z-index: ${ifMiniNav(theme.zIndex.navbar - 2, theme.zIndex.navbar - 1)};
  overflow: hidden;
  ${(props: {colorSchema: BookWithOSWebData['theme'] | undefined }) => props.colorSchema && css`
    background: linear-gradient(to right,
      ${assertDefined(
        theme.color.primary[props.colorSchema], `Could not find values for theme named "${props.colorSchema}"`
      ).base},
      ${assertDefined(
        gradients[props.colorSchema], `theme ${props.colorSchema} needs gradient defined in BookBanner.tsx`
      )});
  `}

  ${(props) => props.up && css`
    transform: translateY(-${bookBannerDesktopMiniHeight}rem);
    ${theme.breakpoints.mobile(css`
      transform: translateY(-${bookBannerMobileMiniHeight}rem);
    `)}
  `}

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
    height: ${ifMiniNav(bookBannerMobileMiniHeight, bookBannerMobileBigHeight)}rem;
    ${ifMiniNav(`margin-top: -${bookBannerMobileMiniHeight}rem`)}
  `)}

  ${ifMiniNav(`margin-top: -${bookBannerDesktopMiniHeight}rem`)}
`;

// tslint:disable-next-line:variable-name
export class BookBanner extends Component<PropTypes, {scrollTransition: boolean}> {
  public state = {
    scrollTransition: false,
  };
  private miniBanner = React.createRef<HTMLDivElement>();
  private bigBanner = React.createRef<HTMLDivElement>();

  public handleScroll = () => {
    if (this.miniBanner.current && this.bigBanner.current && typeof(window) !== 'undefined') {
      const miniRect = this.miniBanner.current.getBoundingClientRect();
      this.setState({
        scrollTransition: miniRect.top === 0 &&
          this.bigBanner.current.offsetTop + this.bigBanner.current.clientHeight > window.scrollY,
      });
    }
  };

  public handleLinkClick = async(e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (isClickWithModifierKeys(e) || !this.props.hasUnsavedHighlight) {
      return;
    }

    e.preventDefault();

    if (!await showConfirmation()) {
      return;
    }

    assertWindow().location.assign(link);
  };

  public componentDidMount() {
    if (typeof document === 'undefined') {
      return;
    }
    document.addEventListener('scroll', this.handleScroll);
    this.handleScroll();
  }

  public render() {
    const { pageNode, book } = this.props;

    if (!book || !pageNode) {
      return <BarWrapper colorSchema={undefined} up={false} />;
    }

    const bookUrl = hasOSWebData(book) ? bookDetailsUrl(book) : notFound.getUrl();

    return this.renderBars({theme: defaultTheme, ...book}, bookUrl, pageNode);
  }

  private renderBars = (
    book: Book & {theme: BookWithOSWebData['theme']},
    bookUrl: string,
    treeSection: ArchiveTreeSection) =>
  ([
    <BarWrapper
      colorSchema={book.theme}
      key='expanded-nav'
      up={this.state.scrollTransition}
      ref={this.bigBanner}
      data-testid='bookbanner'
      data-analytics-region='book-banner-expanded'
    >
      <TopBar>
        <BookTitle
          data-testid='details-link-expanded'
          href={bookUrl}
          colorSchema={book.theme}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            this.handleLinkClick(e, bookUrl);
          }}
        >
          <LeftArrow colorSchema={book.theme} />{book.tree.title}
        </BookTitle>
        <BookChapter colorSchema={book.theme} dangerouslySetInnerHTML={{__html: treeSection.title}} />
      </TopBar>
    </BarWrapper>,
    <BarWrapper
      colorSchema={book.theme}
      variant='mini'
      key='mini-nav'
      ref={this.miniBanner}
      data-analytics-region='book-banner-collapsed'
    >
      <TopBar>
        <BookTitle
          data-testid='details-link-collapsed'
          href={bookUrl}
          colorSchema={book.theme}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            this.handleLinkClick(e, bookUrl);
          }}
        >
          <LeftArrow colorSchema={book.theme} />{book.tree.title}
        </BookTitle>
        <BookChapter colorSchema={book.theme} variant='mini' dangerouslySetInnerHTML={{__html: treeSection.title}} />
      </TopBar>
    </BarWrapper>,
  ]);
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    hasUnsavedHighlight: hasUnsavedHighlight(state),
    pageNode: select.pageNode(state),
  })
)(BookBanner);
