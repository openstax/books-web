import { Highlight } from '@openstax/highlighter/dist/api';

export type HighlightData = Highlight;

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: null | HighlightData[];
  summary: {
    filters: {
      colors: string[];
      chapters: string[];
    },
    loading: boolean;
    chapterCounts: {[key: string]: number};
    highlights: {
      [chapterId: string]: {[pageId: string]: HighlightData[]}
    };
  };
}
