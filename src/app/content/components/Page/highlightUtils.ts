import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import { HighlightData } from '../../highlights/types';
import attachHighlight from '../utils/attachHighlight';
import { HighlightManagerServices } from './highlightManager';

export const isUnknownHighlightData = (highlighter: Highlighter) => (data: HighlightData) =>
  !highlighter.getHighlight(data.id);

export const updateStyle = (highlighter: Highlighter) => (data: HighlightData) => {
  const highlight = highlighter.getHighlight(data.id);

  if (highlight) {
    highlight.setStyle(data.color);
  }
};

export const highlightData = (services: HighlightManagerServices) => (data: HighlightData) => {
  const { highlighter } = services;

  const serialized = SerializedHighlight.fromApiResponse(data);

  return attachHighlight(serialized, highlighter);
};

export const erase = (highlighter: Highlighter) => (highlight: Highlight) => {
  highlighter.erase(highlight);
  return highlight;
};
