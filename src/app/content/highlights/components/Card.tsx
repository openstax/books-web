import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { remsToEms } from '../../../utils';
import { contentTextWidth, searchResultsBarDesktopWidth, sidebarDesktopWidth } from '../../components/constants';
import { disablePrint } from '../../components/utils/disablePrint';
import { styleWhenSidebarClosed } from '../../components/utils/sidebar';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
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
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';
import { cardBorder } from './style';

interface Props {
  isFocused: boolean;
  highlight: Highlight;
  create: typeof createHighlight;
  save: typeof updateHighlight;
  remove: typeof deleteHighlight;
  blur: typeof clearFocusedHighlight;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const Card = (props: Props) => {
  const note = props.data && props.data.note;
  const [editing, setEditing] = React.useState<boolean>(!note);

  React.useEffect(() => {
    if (!props.isFocused) {
      setEditing(false);
    }
  }, [props.isFocused]);

  if (!props.highlight.elements.length) {
    return null;
  }

  const onRemove = () => props.data && props.remove(props.data.id);
  const style = highlightStyles.find((search) => props.data && search.label === props.data.style);

  return !editing && style && note ? <DisplayNote
    isFocused={props.isFocused}
    className={props.className}
    style={style}
    note={note}
    onEdit={() => setEditing(true)}
    onBlur={props.blur}
    onRemove={onRemove}
  /> : <EditCard {...props} onRemove={onRemove} />;
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

const overlapDisplay = css`
  ${(props: Props) => !!props.isFocused && css`
    left: unset;
    right: ${cardMinWindowMargin}rem;
    top: ${() => {
      const lastElement = props.highlight.elements[props.highlight.elements.length - 1] as HTMLElement | undefined;
      const bottomOffset = lastElement ? lastElement.offsetTop + lastElement.offsetHeight : 0;

      return bottomOffset;
    }}px;
  `}
  ${(props: Props) => !props.isFocused && css`
    display: none;
  `}
`;

const rightSideDisplay = css`
  left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardContentMargin}rem);
  right: unset;
  top: ${(props: Props) => {
    const firstElement = props.highlight.elements[0] as HTMLElement | undefined;
    return firstElement ? firstElement.offsetTop : 0;
  }}px;
  ${(props: Props) => !!props.isFocused && css`
    left: calc(100% - ((100% - ${contentTextWidth}rem) / 2) + ${cardFocusedContentMargin}rem);
  `}
  ${(props: Props) => !props.isFocused && css`
    /* temporary simplification */
    display: none;
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

    if (!data || !data.style) {
      return null;
    }

    const style = highlightStyles.find((search) => search.label === props.data.style);

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

  @media (max-width: ${remsToEms(contentTextWidth + searchResultsBarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when search is open */
    ${rightSideDisplay}
    ${(props: {hasQuery: boolean}) => !!props.hasQuery && overlapDisplay}
  }

  @media (max-width: ${remsToEms(contentTextWidth + sidebarDesktopWidth + additionalWidthForCard)}em) {
    /* the window is too small to show note cards next to content when the toc is open */
    ${overlapDisplay}
    ${styleWhenSidebarClosed(rightSideDisplay)}
  }

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
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isOpen: contentSelect.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    remove: flow(deleteHighlight, dispatch),
    save: flow(updateHighlight, dispatch),
  })
)(StyledCard);
