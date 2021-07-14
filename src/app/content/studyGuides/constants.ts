import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { highlightStyles as highlightsColorStyles } from '../constants';

export const modalUrlName = 'SG';

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> =
  highlightsColorStyles.filter((style) => style.label !== HighlightColorEnum.Pink);

export const colorfilterLabels = new Set(highlightStyles.map(({label}) => label));
