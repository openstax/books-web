import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import { assertDefined } from '../../../utils';
import Card, { getHighlightTopOffset } from './Card';

interface Props {
  container: HTMLElement;
  highlighter: Highlighter;
  highlights: Highlight[];
  className?: string;
}

// TODO: Move those to some file with constants
// highlight's offset is in pixels so those are too.
const minimalCardHeight = 34;
const cardMarginBottom = 20;

// tslint:disable-next-line:variable-name
const Wrapper = ({highlights, className, container, highlighter}: Props) => {
  const element = React.useRef<HTMLElement>(null);
  const [highlightsPositions, setHighlightsPositions] = React.useState<Map<string, number>>(new Map());
  const [highlightsHeights, setHighlightsHeights] = React.useState<Map<string, number>>(new Map());

  const onHeightChange = (id: string, height: number) => {
    setHighlightsHeights((data) => new Map(data.set(id, height)));
  };

  const onFocus = (id: string) => {
    const highlight = highlights.find((search) => search.id === id);
    const position = highlightsPositions.get(id);
    if (typeof position !== 'number' || !highlight) { return; }

    const topOffset = assertDefined(
      getHighlightTopOffset(container, highlight),
      `Couldn't get top offset for highlights`
    );

    if (position > topOffset) {
      element.current!.style.top = `-${position - topOffset}px`;
    }
  };

  const onBlur = () => {
    element.current!.style.top = '0';
  };

  const updatePositions = React.useCallback(() => {
    const newPositions: Map<string, number> = new Map();
    for (const [index, highlight] of highlights.entries()) {
      const topOffset = assertDefined(
        getHighlightTopOffset(container, highlight),
        `Couldn't get top offset for highlights`
      );

      const prevHighlightId = highlights[index - 1] && highlights[index - 1].id;
      const prevHighlightPosition = newPositions.get(prevHighlightId) || highlightsPositions.get(prevHighlightId);
      const prevHighlightHeight = highlightsHeights.get(prevHighlightId) || minimalCardHeight;

      let stackedTopOffset = prevHighlightPosition || 0;

      if ((topOffset - prevHighlightHeight) < stackedTopOffset) {
        stackedTopOffset = stackedTopOffset
          + prevHighlightHeight
          + (index > 0 ? cardMarginBottom : 0);
      } else {
        stackedTopOffset = topOffset;
      }

      newPositions.set(highlight.id, stackedTopOffset);

      setHighlightsPositions(newPositions);
    }
  }, [highlights, highlightsHeights, container]);

  React.useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  return <div className={className} ref={element}>
    {highlights.map((highlight) => <Card
      highlighter={highlighter}
      highlight={highlight}
      key={highlight.id}
      container={container}
      topOffset={highlightsPositions.get(highlight.id) || 0}
      onHeightChange={onHeightChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />)}
  </div>;
};

export default styled(Wrapper)`
  position: relative;
  overflow: visible;
  z-index: ${theme.zIndex.highlightInlineCard};
  top: 0;
  transition: all 0.3s;
`;
