import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement, KeyboardEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import { isHtmlElement } from '../../../guards';
import { useFocusLost, useKeyCombination } from '../../../reactUtils';
import { AppState } from '../../../types';
import { assertDefined } from '../../../utils';
import * as selectSearch from '../../search/selectors';
import * as contentSelect from '../../selectors';
import { highlightKeyCombination } from '../constants';
import { focused } from '../selectors';
import Card from './Card';
import { mainWrapperStyles } from './cardStyles';
import { getHighlightOffset, noopKeyCombinationHandler, updateCardsPositions } from './cardUtils';

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
  const [offsets, setOffsets] = React.useState<Map<string, { top: number, bottom: number }>>(new Map());
  const [shouldFocusCard, setShouldFocusCard] = React.useState(false);
  const focusedId = useSelector(focused);
  const focusedHighlight = React.useMemo(
    () => highlights.find((highlight) => highlight.id === focusedId),
    [focusedId, highlights]);
  const setNewCardsPositionsRef = React.useRef<() => void>();

  // This function is triggered by keyboard shortuct defined in useKeyCombination(...)
  // It moves focus between Card component and highlight in the content.
  const moveFocus = React.useCallback((event: KeyboardEvent) => {
    const activeElement = isHtmlElement(event.target) ? event.target : null;

    if (!focusedHighlight || !activeElement || !element.current) {
      return;
    }

    if (element.current.contains(activeElement)) {
      focusedHighlight.focus();
    } else {
      setShouldFocusCard(true);
    }
  }, [element, focusedHighlight]);

  useKeyCombination(highlightKeyCombination, moveFocus, noopKeyCombinationHandler([container, element]));

  // Clear shouldFocusCard when focus is lost from the CardWrapper.
  // If we don't do this then card related for the focused highlight will be focused automatically.
  useFocusLost(element, shouldFocusCard, React.useCallback(() => setShouldFocusCard(false), [setShouldFocusCard]));

  const onHeightChange = React.useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    const height = ref.current && ref.current.offsetHeight;
    if (cardsHeights.get(id) !== height) {
      setCardsHeights((previous) => new Map(previous).set(id, height === null ? 0 : height));
    }
  }, [cardsHeights]);

  const getOffsetsForHighlight = React.useCallback((highlight: Highlight) => {
    const newOffsets = assertDefined(
      getHighlightOffset(container, highlight),
      `Couldn't get offsets for highlight with an id: ${highlight.id}`
    );
    setOffsets((state) => new Map(state).set(highlight.id, newOffsets));
    return newOffsets;
  }, [container]);

  const checkIfHiddenByCollapsedAncestor = (highlight: Highlight) => {
    const highlightElement = highlight.elements[0] as HTMLElement;
    const collapsedAncestor = highlightElement
      ? highlightElement.closest('[data-type="solution"][aria-expanded="false"]')
      : null;
    return Boolean(collapsedAncestor);
  };

  React.useEffect(() => {
    setNewCardsPositionsRef.current = () => {
      const positions = updateCardsPositions(focusedHighlight, highlights, cardsHeights, getOffsetsForHighlight);
      setCardsPositions(positions);
    };
    setNewCardsPositionsRef.current();
  }, [cardsHeights, focusedHighlight, getOffsetsForHighlight, highlights]);

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      assertDefined(
        setNewCardsPositionsRef.current,
        'setNewCardsPositionsRef should be already defined by useEffect'
      )();
    });
    resizeObserver.observe(container);
    return () => {
        resizeObserver.disconnect();
    };
  }, [container]);

  return highlights.length
    ? <div className={className} ref={element}>
      {highlights.map((highlight, index) => {
        const focusThisCard = shouldFocusCard && focusedId === highlight.id;
        return <Card
          highlighter={highlighter}
          highlight={highlight}
          key={highlight.id}
          container={container}
          topOffset={cardsPositions.get(highlight.id)}
          highlightOffsets={offsets.get(highlight.id)}
          onHeightChange={(ref: React.RefObject<HTMLElement>) => onHeightChange(highlight.id, ref)}
          zIndex={highlights.length - index}
          shouldFocusCard={focusThisCard}
          isHidden={checkIfHiddenByCollapsedAncestor(highlight)}
        />;
      })}
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
