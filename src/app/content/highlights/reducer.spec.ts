import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { receiveFeatureFlags } from '../../actions';
import * as actions from './actions';
import { highlightingFeatureFlag } from './constants';
import reducer, { initialState } from './reducer';
import {
  HighlightData,
  HighlightsTotalCountsPerPage,
  SummaryHighlights,
} from './types';

const mockHighlight = {
  color: HighlightColorEnum.Blue,
  id: 'asdf',
} as HighlightData;

describe('highlight reducer', () => {

  it('is initially disabled', () => {
    const newState = reducer(undefined, {type: 'adsf'} as any);
    expect(newState.enabled).toEqual(false);
  });

  it('activates feature flag', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags([highlightingFeatureFlag]));

    expect(state.enabled).toEqual(true);
  });

  it('doesn\'t active for other flags', () => {
    const state = reducer({
      ...initialState,
      enabled: false,
    }, receiveFeatureFlags(['asdf']));

    expect(state.enabled).toEqual(false);
  });

  it('focuses highlight', () => {
    const state = reducer(undefined, actions.focusHighlight('asdf'));
    expect(state.focused).toEqual('asdf');
  });

  it('clears focused highlight', () => {
    const state = reducer({...initialState, focused: 'asdf'}, actions.clearFocusedHighlight());
    expect(state.focused).toEqual(undefined);
  });

  it('removing the focused highlight also clears focus', () => {
    const state = reducer({
      ...initialState,
      focused: 'asdf',
      highlights: [mockHighlight],
    }, actions.deleteHighlight(mockHighlight.id, {
      locationFilterId: 'highlightChapter',
      pageId: 'highlightSource',
    }));
    expect(state.focused).toEqual(undefined);
  });

  it('receive total counts', () => {
    const totalCountsPerPage: HighlightsTotalCountsPerPage = {
      page1: 1,
      page2: 2,
    };

    const state = reducer({
      ...initialState,
    }, actions.receiveHighlightsTotalCounts(totalCountsPerPage));

    expect(state.summary.totalCountsPerPage).toMatchObject(totalCountsPerPage);
  });

  it('creates highlights', () => {
    const state = reducer({
      ...initialState,
      summary: {
        ...initialState.summary,
        filters: {
          ...initialState.summary.filters,
          locationIds: ['highlightChapter'],
        },
      },
    }, actions.createHighlight(mockHighlight as any, {
      locationFilterId: 'highlightChapter',
      pageId: 'highlightSource',
    }));

    if (!(state.highlights instanceof Array)) {
      return expect(state.highlights).toBe(expect.any(Array));
    }
    expect(state.highlights.length).toEqual(1);
    expect(state.highlights[0].id).toEqual('asdf');
    expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: 1 });
    const highlights = state.summary.highlights.highlightChapter.highlightSource;
    expect(highlights.length).toEqual(1);
    expect(highlights.find((h) => h.id === mockHighlight.id)).toBeTruthy();
  });

  describe('deleteHighlight', () => {

    it('noops with no highlights', () => {
      const state = reducer({
        ...initialState,
      }, actions.deleteHighlight('asdf', {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      expect(state.highlights).toBe(null);
    });

    it('deletes', () => {
      const state = reducer({
        ...initialState,
        highlights: [mockHighlight],
        summary: {
          ...initialState.summary,
          highlights: {
            highlightChapter: {
              highlightSource: [mockHighlight],
              otherHighlightSource: [mockHighlight],
            },
          },
          totalCountsPerPage: {
            highlightSource: 2,
          },
        },
      }, actions.deleteHighlight(mockHighlight.id, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights.length).toEqual(0);
      expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: 1 });
      const chapterHighlights = state.summary.highlights.highlightChapter;
      expect(Object.keys(chapterHighlights).length).toEqual(1);
      expect(chapterHighlights.highlightSource).toBeUndefined();
    });
  });

  describe('updateHighlight', () => {

    it('noops if there are no highlgihts', () => {
      const state = reducer({
        ...initialState,
      }, actions.updateHighlight({id: 'asdf', highlight: {annotation: 'asdf'}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      expect(state.highlights).toBe(null);
    });

    it('updates', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
        summary: {
          ...initialState.summary,
          filters: {
            ...initialState.summary.filters,
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [mock1, mock3],
            },
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {annotation: 'asdf'}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights[0].annotation).toEqual('asdf');
      expect(state.highlights[1]).toEqual(mock3);
      const highlights = state.summary.highlights.highlightChapter.highlightSource;
      expect(highlights[0].annotation).toEqual('asdf');
      expect(highlights[1]).toEqual(mock3);
    });

    it('remove highlight from summary highlights if color filters does not match', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [mock1, mock3],
            },
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Green}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights[0].color).toEqual(HighlightColorEnum.Green);
      expect(state.highlights[1]).toEqual(mock3);
      const highlights = state.summary.highlights.highlightChapter.highlightSource;
      expect(highlights.length).toEqual(1);
      expect(highlights[0]).toEqual(mock3);
    });

    it('add highlight to summary highlights if new color match current filters', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          highlights: {
            highlightChapter: {
              highlightSource: [],
            },
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Blue}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      if (!(state.highlights instanceof Array)) {
        return expect(state.highlights).toBe(expect.any(Array));
      }

      expect(state.highlights[0].color).toEqual(HighlightColorEnum.Blue);
      expect(state.highlights[1]).toEqual(mock3);
      const highlights = state.summary.highlights.highlightChapter.highlightSource;
      expect(highlights.length).toEqual(1);
      expect(highlights[0].color).toEqual(HighlightUpdateColorEnum.Blue);
    });

    it('return state if new highlight was not found in it', () => {
      const mock1 = mockHighlight;
      const mock3 = {...mockHighlight, id: 'qwer'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
      }, actions.updateHighlight({id: 'id-not-exists', highlight: {color: HighlightUpdateColorEnum.Blue}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      expect(state).toMatchObject(state);
    });
  });

  describe('update summary', () => {
    it('set summary filters', () => {
      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            colors: [],
            locationIds: [],
          },
        },
      }, actions.setSummaryFilters({
        colors: [HighlightColorEnum.Green],
        locationIds: ['id'],
      }));

      expect(state.summary.filters.locationIds[0]).toEqual('id');
      expect(state.summary.filters.locationIds.length).toEqual(1);
      expect(state.summary.filters.colors[0]).toEqual(HighlightColorEnum.Green);
      expect(state.summary.filters.colors.length).toEqual(1);
      expect(state.summary.loading).toEqual(true);
    });

    it('receive summary highlights', () => {
      const highlights: SummaryHighlights = {
        chapter_id: {
          page_id: [
            {id: 'highlight'} as HighlightData,
          ],
        },
      };

      const state = reducer({
        ...initialState,
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Green],
            locationIds: ['id'],
          },
          loading: true,
        },
      }, actions.receiveSummaryHighlights(highlights));

      expect(state.summary.highlights).toMatchObject(highlights);
      expect(state.summary.loading).toEqual(false);
    });
  });
});
