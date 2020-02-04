import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import * as selectAuth from '../../../auth/selectors';
import { User } from '../../../auth/types';
import { findElementSelfOrParent } from '../../../domUtils';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { assertWindow, remsToEms } from '../../../utils';
import { contentTextWidth, searchResultsBarDesktopWidth, sidebarDesktopWidth } from '../../components/constants';
import { disablePrint } from '../../components/utils/disablePrint';
import { styleWhenSidebarClosed } from '../../components/utils/sidebar';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as contentSelect from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { clearFocusedHighlight, createHighlight, deleteHighlight, updateHighlight } from '../actions';
import {
  cardContentMargin,
  cardFocusedContentMargin,
  cardMinWindowMargin,
  cardPadding,
  cardWidth,
  highlightStyles
} from '../constants';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import { cardBorder } from './style';

interface Props {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isFocused: boolean;
  user: User;
  loginLink: string;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  save: typeof updateHighlight;
  remove: typeof deleteHighlight;
  blur: typeof clearFocusedHighlight;
  data?: HighlightData;
  className: string;
  topOffset: number;
  onHeightChange: (id: string, height: number) => void;
  onFocus: (id: string) => void;
  onBlur: () => void;
}

// tslint:disable-next-line:variable-name
const Card = (props: Props) => {
  const annotation = props.data && props.data.annotation;
  const element = React.useRef<HTMLElement>(null);
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const locationFilters = useSelector(selectHighlights.highlightLocationFilters);

  React.useEffect(() => {
    if (element.current && props.isFocused) {
      props.onFocus(props.highlight.id);
    }
    if (!props.isFocused) {
      setEditing(false);
      props.onBlur();
    }
  }, [props.isFocused]);

  React.useEffect(() => {
    if (annotation) {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.add('has-note'));
    } else {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.remove('has-note'));
    }
  }, [props.highlight, annotation]);

  React.useEffect(() => {
    if (element.current) {
      props.onHeightChange(props.highlight.id, element.current.offsetHeight);
    }
  }, [props.highlight.id, element]);

  const {page, book} = props;

  if (!props.highlight.range || !page || !book) {
    return null;
  }

  const location = getHighlightLocationFilterForPage(locationFilters, page);
  if (!location) { return null; }

  const locationFilterId = stripIdVersion(location.id);

  const onRemove = () => {
    if (props.data) {
      props.remove(props.data.id, {
        locationFilterId,
        pageId: page.id,
      });
    }
  };
  const style = highlightStyles.find((search) => props.data && search.label === props.data.color);

  const onCreate = () => {
    props.create({
      ...props.highlight.serialize().getApiPayload(props.highlighter, props.highlight),
      scopeId: book.id,
      sourceId: page.id,
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      locationFilterId,
      pageId: page.id,
    });
  };

  const commonProps = {
    className: props.className,
    isFocused: props.isFocused,
    onBlur: props.blur,
    onRemove,
    ref: element,
  };

  return !editing && style && annotation ? <DisplayNote
    {...commonProps}
    style={style}
    note={annotation}
    onEdit={() => setEditing(true)}
  /> : <EditCard
    {...commonProps}
    authenticated={!!props.user}
    loginLink={props.loginLink}
    highlight={props.highlight}
    locationFilterId={locationFilterId}
    pageId={page.id}
    onCreate={onCreate}
    onCancel={() => setEditing(false)}
    onSave={props.save}
    data={props.data}
  />;
};

/*
 * putting overflow hidden on a page wrapper that aligns with the window edge would
 * include the sidebar, which would break position: sticky.
 *
 * avoiding using an overflow hidden to hide cards when there is not enough space
 * means being very explicit about hiding them so they don't create a horizontal
 * scrollbar.
 *
 * in this case that means using extensive knowledge about the container widths,
 * which unfortunately means knowledge of all the sidebar widths and their state
 * too.
 *
 * consider making a helper like `styleWhenSidebarClosed` maybe `styleWhenContentWidth`
 * that has a selector to get the relevant stuff.
 */

const additionalWidthForCard = (cardWidth + cardContentMargin + cardMinWindowMargin) * 2;

const getHighlightOffset = (container: HTMLElement | undefined, highlight: Highlight) => {
  if (!container || !highlight.range || !highlight.range.getBoundingClientRect) {
    return;
  }

  const {top, bottom } = highlight.range.getBoundingClientRect();

  const offsetParent = container.offsetParent && findElementSelfOrParent(container.offsetParent);
  const parentOffset = offsetParent ? offsetParent.offsetTop : 0;
  const scrollOffset = assertWindow().scrollY;

  return {
    bottom: bottom - parentOffset + scrollOffset,
    top: top - parentOffset + scrollOffset,
  };
};

export const getHighlightTopOffset = (container: HTMLElement | undefined, highlight: Highlight): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.top;
  }
};
const getHighlightBottomOffset = (container: HTMLElement | undefined, highlight: Highlight): number | undefined => {
  const offset = getHighlightOffset(container, highlight);

  if (offset) {
    return offset.bottom;
  }
};

const overlapDisplay = css`
  ${(props: Props) => !!props.isFocused && css`
    left: unset;
    right: ${cardMinWindowMargin}rem;
    top: ${() => {
      return getHighlightBottomOffset(props.container, props.highlight) || 0;
    }}px;
  `}
  ${(props: Props) => !props.isFocused && css`
    display: none;
  `}
`;

const rightSideDisplay = css`
  left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardContentMargin}rem);
  right: unset;
  top: ${(props: Props) => `${props.topOffset}px;`}
  ${(props: Props) => !!props.isFocused && css`
    left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardFocusedContentMargin}rem);
  `}
`;

const mobileDisplay = css`
  ${(props: Props) => !!props.isFocused && css`
    left: 0;
    right: 0;
    bottom: 0;
    top: unset;
    position: fixed;
    padding: 0;
  `}
  ${(props: Props) => !props.isFocused && css`
    display: none;
  `}
`;

// tslint:disable-next-line:variable-name
const StyledCard = styled(Card)`
  position: absolute;
  padding: ${cardPadding}rem;
  ${cardBorder}
  ${rightSideDisplay}
  ${disablePrint}

  ${(props: {data: HighlightData}) => {
    const data = props.data;

    if (!data || !data.color) {
      return null;
    }

    const style = highlightStyles.find((search) => search.label === props.data.color);

    if (!style) {
      return null;
    }

    return css`
      ::before {
        content: ' ';
        border-radius: 0.4rem 0 0 0.4rem;
        position: absolute;
        top: 0;
        left: 0
        bottom: 0;
        width: ${cardPadding / 2}rem;
        background-color: ${style.focused};
      }
      ${theme.breakpoints.mobile(css`
        ::before {
          border-radius: 0.4rem 0.4rem 0 0;
          right: 0;
          bottom: unset;
          width: unset;
          height: ${cardPadding / 2}rem;
        }
     `)}
    `;
  }}

  @media (max-width: ${remsToEms(contentTextWidth + sidebarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when the toc is open */
    ${overlapDisplay}
    ${styleWhenSidebarClosed(rightSideDisplay)}
  }

  ${(props: {hasQuery: boolean}) => !!props.hasQuery && css`
    @media (max-width: ${remsToEms(contentTextWidth + searchResultsBarDesktopWidth + additionalWidthForCard)}em) {
      /* the window is too small to show note cards next to content when search is open */
      ${overlapDisplay}
    }
  `}

  @media (max-width: ${remsToEms(contentTextWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content even without sidebars */
    ${overlapDisplay}
  }

  ${theme.breakpoints.mobile(css`
    ${mobileDisplay}
 `)}
`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isOpen: contentSelect.tocOpen(state),
    loginLink: selectAuth.loginLink(state),
    user: selectAuth.user(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    remove: flow(deleteHighlight, dispatch),
    save: flow(updateHighlight, dispatch),
  })
)(StyledCard);
