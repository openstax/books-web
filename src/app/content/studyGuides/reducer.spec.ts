import { receiveFeatureFlags } from '../../featureFlags/actions';
import { locationChange } from '../../navigation/actions';
import { studyGuidesFeatureFlag } from '../constants';
import { HighlightData, SummaryHighlights } from '../highlights/types';
import * as actions from './actions';
import reducer, { initialState } from './reducer';

describe('study guides reducer', () => {
  it('keeps summary open on location change if modal query is present', () => {
    const mockState = {
      ...initialState,
      summary: {...initialState.summary, open: true},
    };

    const state = reducer(
      mockState,
      locationChange({action: 'PUSH', location: {state: {pageUid: 'asdf'}, search: '?modal=SG'}} as any));
    expect(state.summary.open).toBe(true);
  });

  it('updates color filters with passed parameters on location change if colors query is present', () => {
    const mockState = {
      ...initialState,
      summary: {...initialState.summary, open: true, filters: { ...initialState.summary.filters, colors: [] }},
    };

    let state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=green&colors=yellow',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual(['green', 'yellow']);

    state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=green',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual(['green']);

    state = reducer(
      mockState,
      locationChange({
        action: 'REPLACE',
        location: {
          search: '?modal=SG&colors=wrong-color',
          state: {pageUid: 'asdf'},
        },
      } as any));
    expect(state.summary.filters.colors).toEqual([]);
  });

  it('receive study guides', () => {
    const summary = {
      location: {
        page: [],
      },
    } as SummaryHighlights;
    const state = reducer(undefined, actions.receiveSummaryStudyGuides(summary, {pagination: null}));

    expect(state.summary.studyGuides).toEqual(summary);
  });

  it('enables study guides on receiveFeatureFlags', () => {
    const state = reducer(initialState, receiveFeatureFlags([studyGuidesFeatureFlag]));
    expect(state.isEnabled).toEqual(true);
  });

  it('sets summary filters', () => {
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
      locationIds: ['id'],
    }));

    expect(state.summary.filters.locationIds[0]).toEqual('id');
    expect(state.summary.filters.locationIds.length).toEqual(1);
    expect(state.summary.loading).toEqual(true);
  });

  it('noops for receive summary study guides with stale filters', () => {
    const highlights: SummaryHighlights = {
      chapter_id: {
        page_id: [
          {id: 'highlight'} as HighlightData,
        ],
      },
    };

    const staleFilters = {
      colors: initialState.summary.filters.colors,
      locationIds: [],
    };

    const state = reducer(
      initialState,
      actions.receiveSummaryStudyGuides(highlights, {pagination: null, filters: staleFilters }));

    expect(state).toEqual(initialState);
  });
});
