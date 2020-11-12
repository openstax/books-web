import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { highlightStyles as highlightsColorStyles } from '../constants';

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> =
  highlightsColorStyles.filter((style) => style.label !== HighlightColorEnum.Pink);
