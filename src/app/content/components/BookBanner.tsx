import { HTMLAnchorElement, HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components/macro';
import { ChevronLeft } from 'styled-icons/boxicons-regular/ChevronLeft';
import { maxNavWidth } from '../../components/NavBar';
import { h3MobileLineHeight, h3Style, h4Style, textRegularLineHeight } from '../../components/Typography';
import { useServices } from '../../context/Services';
import theme from '../../theme';
import { assertDefined, assertWindow } from '../../utils';
import { hasOSWebData } from '../guards';
import showConfirmation from '../highlights/components/utils/showConfirmation';
import { hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../highlights/selectors';
import * as select from '../selectors';
import { ArchiveTreeSection , Book, BookWithOSWebData } from '../types';
import { isClickWithModifierKeys } from '../utils/domUtils';
import { bookDetailsUrl } from '../utils/urlUtils';
import {
  bookBannerDesktopBigHeight,
  bookBannerDesktopMiniHeight,
  bookBannerMobileBigHeight,
  bookBannerMobileMiniHeight,
  contentTextWidth
} from './constants';
import { applyBookTextColor } from './utils/applyBookTextColor';
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

// tslint:disable-next-line:variable-name
const LeftArrow = styled(ChevronLeft)`
  margin-top: -0.25rem;
  margin-left: -0.8rem;
  height: 3rem;
  width: 3rem;
  ${applyBookTextColor}
`;

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

const bookTitleStyles = css`
  ${h4Style}
  ${bookBannerTextStyle}
  display: ${ifMiniNav('inline-block', 'block')};
  height: ${textRegularLineHeight}rem;
  font-weight: normal;
  text-decoration: none;
  margin: 0;

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
const BookTitle = styled.span`
  ${bookTitleStyles}
`;

// tslint:disable-next-line:variable-name
const BookTitleLink = styled.a`
  ${bookTitleStyles}
  :hover {
    text-decoration: underline;
  }
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
const BookBanner = () => {
  const [scrollTransition, setScrollTransition] = React.useState(false);
  const [tabbableBanner, setTabbableBanner] = React.useState('big');
  const book = useSelector(select.book);
  const pageNode = useSelector(select.pageNode);
  const bookTheme = useSelector(select.bookTheme);
  const hasUnsavedHighlight = useSelector(hasUnsavedHighlightSelector);
  const miniBanner = React.useRef<HTMLDivElement>();
  const bigBanner = React.useRef<HTMLDivElement>();
  const services = useServices();

  const handleScroll = () => {
    if (miniBanner.current && bigBanner.current && typeof(window) !== 'undefined') {
      const miniRect = miniBanner.current.getBoundingClientRect();

      setScrollTransition(miniRect.top === 0
        && bigBanner.current.offsetTop + bigBanner.current.clientHeight > window.scrollY);
      setTabbableBanner(miniRect.top === 0 ? 'mini' : 'big');
    }
  };

  const handleLinkClick = async(e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (isClickWithModifierKeys(e) || !hasUnsavedHighlight) {
      return;
    }
    e.preventDefault();

    if (!await showConfirmation(services)) {
      return;
    }
    assertWindow().location.assign(link);
  };

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.addEventListener('scroll', handleScroll);
    handleScroll();
  }, []);

  const renderBars = (
    bookWithTheme: Book & {theme: BookWithOSWebData['theme']},
    url: string | undefined,
    treeSection?: ArchiveTreeSection) =>
  ([
    <BarWrapper
      colorSchema={bookWithTheme.theme}
      key='expanded-nav'
      up={scrollTransition}
      ref={bigBanner}
      data-testid='bookbanner'
      data-analytics-region='book-banner-expanded'
    >
      <TopBar>
        {
          url === undefined
            ? <BookTitle data-testid='book-title-expanded' colorSchema={bookWithTheme.theme}>
              {bookWithTheme.tree.title}
            </BookTitle>
            : <BookTitleLink
              data-testid='details-link-expanded'
              href={url}
              colorSchema={bookWithTheme.theme}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                handleLinkClick(e, url);
              }}
              tabIndex={tabbableBanner === 'big' ? undefined : -1}
            >
              <LeftArrow colorSchema={bookWithTheme.theme} />{bookWithTheme.tree.title}
            </BookTitleLink>
        }
        {treeSection
          ? <BookChapter
            colorSchema={bookWithTheme.theme}
            dangerouslySetInnerHTML={{ __html: treeSection.title }}
          />
          : null}
      </TopBar>
    </BarWrapper>,
    <BarWrapper
      colorSchema={bookWithTheme.theme}
      variant='mini'
      key='mini-nav'
      ref={miniBanner}
      data-testid='bookbanner-collapsed'
      data-analytics-region='book-banner-collapsed'
    >
      <TopBar>
        {
          url === undefined
            ? <BookTitle data-testid='book-title-collapsed' colorSchema={bookWithTheme.theme} variant='mini'>
              {bookWithTheme.tree.title}
            </BookTitle>
            : <BookTitleLink
              data-testid='details-link-collapsed'
              href={url}
              variant='mini'
              colorSchema={bookWithTheme.theme}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                handleLinkClick(e, url);
              }}
              tabIndex={tabbableBanner === 'mini' ? undefined : -1}
            >
              <LeftArrow colorSchema={bookWithTheme.theme} />{bookWithTheme.tree.title}
            </BookTitleLink>
        }
        {treeSection
          ? <BookChapter
            colorSchema={bookWithTheme.theme}
            variant='mini'
            dangerouslySetInnerHTML={{ __html: treeSection.title }}
          />
          : null
        }
      </TopBar>
    </BarWrapper>,
  ]);

  if (!book) {
    return <BarWrapper colorSchema={undefined} up={false} />;
  }

  const bookUrl = hasOSWebData(book)
    ? book.book_state !== 'retired'
      ? bookDetailsUrl(book)
      : undefined
    : undefined;

  return <>{renderBars({theme: bookTheme, ...book}, bookUrl, pageNode)}</>;
};

export default BookBanner;
