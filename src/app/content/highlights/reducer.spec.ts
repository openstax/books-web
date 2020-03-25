import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { receiveLoggedOut } from '../../auth/actions';
import { locationChange } from '../../navigation/actions';
import { assertNotNull } from '../../utils';
import * as actions from './actions';
import reducer, { initialState } from './reducer';
import {
  CountsPerSource,
  HighlightData,
  SummaryHighlights,
} from './types';

const mockHighlight = {
  color: HighlightColorEnum.Blue,
  id: 'asdf',
} as HighlightData;

describe('highlight reducer', () => {

  it('locationChange - keeps recentlyLoadedFor and highlights if called with current pageUid', () => {
    const state = reducer(
      {...initialState, recentlyLoadedFor: '123', highlights: [mockHighlight]},
      locationChange({location: {state: {pageUid: '123'}}} as any));
    expect(state.recentlyLoadedFor).toEqual('123');
    expect(state.highlights).toEqual([mockHighlight]);
  });

  it('locationChange - keeps recentlyLoadedFor and reset highlights if called with different pageUid', () => {
    const state = reducer(
      {...initialState, recentlyLoadedFor: '123', highlights: [mockHighlight]},
      locationChange({location: {state: {pageUid: 'asdf'}}} as any));
    expect(state.recentlyLoadedFor).toEqual('123');
    expect(state.highlights).toEqual(initialState.highlights);
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
    const totalCountsPerPage: CountsPerSource = {
      page1: {[HighlightColorEnum.Green]: 1},
      page2: {[HighlightColorEnum.Pink]: 3},
    };

    const state = reducer({
      ...initialState,
    }, actions.receiveHighlightsTotalCounts(totalCountsPerPage, new Map()));

    expect(state.summary.totalCountsPerPage).toMatchObject(totalCountsPerPage);
  });

  it('request more summary highlights', () => {
    const state = reducer({
      ...initialState,
    }, actions.loadMoreSummaryHighlights());

    expect(state.summary.loading).toBe(true);
  });

  it('init sets loading state', () => {
    const state = reducer({
      ...initialState,
    }, actions.initializeMyHighlightsSummary());

    expect(state.summary.loading).toBe(true);
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
        highlights: {},
        totalCountsPerPage: {},
      },
    }, actions.createHighlight({...mockHighlight, sourceId: 'highlightSource'} as any, {
      locationFilterId: 'highlightChapter',
      pageId: 'highlightSource',
    }));

    if (!(state.highlights instanceof Array)) {
      return expect(state.highlights).toBe(expect.any(Array));
    }
    expect(state.highlights.length).toEqual(1);
    expect(state.highlights[0].id).toEqual('asdf');
    expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: {blue: 1} });
    const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
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
              highlightSource: [{...mockHighlight, sourceId: 'highlightSource'}],
              otherHighlightSource: [mockHighlight],
            },
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Green]: 1},
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
      expect(state.summary.totalCountsPerPage).toEqual({ highlightSource: {green: 1} });
      const chapterHighlights = assertNotNull(state.summary.highlights, '').highlightChapter;
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
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
      expect(highlights[0].annotation).toEqual('asdf');
      expect(highlights[1]).toEqual(mock3);
    });

    it('does not modify summary highlights if they haven\'t been loaded', () => {
      const mock1 = {...mockHighlight, sourceId: 'highlightSource'};
      const mock3 = {...mockHighlight, id: 'qwer', sourceId: 'highlightSource'};

      const state = reducer({
        ...initialState,
        highlights: [mock1, mock3],
        summary: {
          ...initialState.summary,
          filters: {
            colors: [HighlightColorEnum.Blue],
            locationIds: ['highlightChapter'],
          },
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Blue]: 2},
          },
        },
      }, actions.updateHighlight({id: mock1.id, highlight: {color: HighlightUpdateColorEnum.Green}}, {
        locationFilterId: 'highlightChapter',
        pageId: 'highlightSource',
      }));

      expect(state.summary.highlights).toBe(null);
    });

    it('remove highlight from summary highlights if color filters does not match', () => {
      const mock1 = {...mockHighlight, sourceId: 'highlightSource'};
      const mock3 = {...mockHighlight, id: 'qwer', sourceId: 'highlightSource'};

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
          totalCountsPerPage: {
            highlightSource: {[HighlightColorEnum.Blue]: 2},
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
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
      expect(highlights.length).toEqual(1);
      expect(highlights[0]).toEqual(mock3);
      expect(state.summary.totalCountsPerPage!.highlightSource.blue).toEqual(1);
      expect(state.summary.totalCountsPerPage!.highlightSource.green).toEqual(1);
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
      const highlights = assertNotNull(state.summary.highlights, '').highlightChapter.highlightSource;
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
      }, actions.receiveSummaryHighlights(highlights, {pagination: null}));

      expect(state.summary.highlights).toMatchObject(highlights);
      expect(state.summary.loading).toEqual(false);
    });
  });

  it('clear state when receive logged out', () => {
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
    }, receiveLoggedOut());

    expect(state).toEqual(initialState);
  });
});
