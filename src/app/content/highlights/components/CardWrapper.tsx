import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import equals from 'lodash/fp/equals';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { scrollIntoView } from '../../../domUtils';
import { AppState } from '../../../types';
import { assertDefined, assertNotNull, remsToPx } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { cardMarginBottom } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { getHighlightTopOffset } from './cardUtils';

export interface WrapperProps {
  hasQuery: boolean;
  isTocOpen: boolean;
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: WrapperProps) => {
  const element = React.useRef<HTMLElement>(null);
  const [cardsPositions, setCardsPositions] = React.useState<Map<string, number>>(new Map());
  const [cardsHeights, setCardsHeights] = React.useState<Map<string, number>>(new Map());
  const [topOffsets, setTopOffsets] = React.useState<Map<string, number>>(new Map());
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);
  const prevFocusedHighlights = React.useRef(focusedHighlight);

  const onHeightChange = (id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  };

  const getTopOffsetForHighlight = (highlight: Highlight) => {
    if (topOffsets.has(highlight.id)) {
      return assertDefined(topOffsets.get(highlight.id), 'this has to be defined');
    } else {
      const offset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlight with an id: ${highlight.id}`
      );
      setTopOffsets((state) => new Map(state).set(highlight.id, offset));
      return offset;
    }
  };

  const updateCardsPositions = React.useCallback(() => {
    const newPositions: Map<string, number> = new Map();

    let lastVisibleCardPosition = 0;
    let lastVisibleCardHeight = 0;

    for (const [index, highlight] of highlights.entries()) {
      const topOffset = getTopOffsetForHighlight(highlight);

      const stackedTopOffset = Math.max(topOffset, lastVisibleCardPosition
        + lastVisibleCardHeight
        + (index > 0 ? remsToPx(cardMarginBottom) : 0));

      if (cardsHeights.get(highlight.id)) {
        lastVisibleCardPosition = stackedTopOffset;
        lastVisibleCardHeight = cardsHeights.get(highlight.id)!;
      }

      newPositions.set(highlight.id, stackedTopOffset);
    }

    setCardsPositions(newPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlights, cardsHeights]);

  React.useEffect(() => {
    if (!focusedHighlight && element.current) {
      element.current.style.transform = '';
    }
  }, [focusedHighlight]);

  React.useEffect(updateCardsPositions, [updateCardsPositions]);

  React.useEffect(() => {
    if (!focusedHighlight) { return; }
    const position = cardsPositions.get(focusedHighlight.id);
    // position may be undefined in case of changing a page when highlight is focused
    // because highlights will be already cleared and this function will try to run
    // before page changes.
    if (!position) { return; }
    prevFocusedHighlights.current = focusedHighlight;
    const topOffset = getTopOffsetForHighlight(focusedHighlight);

    if (position > topOffset) {
      assertNotNull(element.current, 'element.current can\'t be null')
        .style.transform = `translateY(-${position - topOffset}px)`;
    }

    // Check for prevFocusedHighlights.current is required so we do not scroll to the
    // focused highlight after user switches between the browser tabs - in this case
    // highlights are refetched and it trigers cardPositions to be updated since reference
    // to the highlights or highlights' data has changed.
    // focusedHighlight.elements[0] will be undefined for pendingHighlight
    if (!equals(focusedHighlight, prevFocusedHighlights.current) && focusedHighlight.elements[0]) {
      scrollIntoView(focusedHighlight.elements[0] as HTMLElement);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedHighlight, cardsPositions]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight, index) => (
        <Card
          highlighter={highlighter}
          highlight={highlight}
          key={highlight.id}
          container={container}
          topOffset={cardsPositions.get(highlight.id)}
          onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
          zIndex={highlights.length - index}
        />
      ))}
    </div>
    : null;
};

export default connect(
  (state: AppState) => ({
    // These are used in the cardStyles.ts
    hasQuery: !!selectSearch.query(state),
    isTocOpen: contentSelect.tocOpen(state),
  })
)(styled(Wrapper)`
  ${mainWrapperStyles}
`);
