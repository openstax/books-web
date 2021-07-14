import { HighlightColorEnum } from '@openstax/highlights-client';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { initialState as initialContentState } from '../../../content/reducer';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { MiddlewareAPI, Store } from '../../../types';
import { setDefaultSummaryFilters, setSummaryFilters, updateSummaryFilters } from '../actions';
import { colorfilterLabels } from '../constants';

describe('openModal', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookBody: typeof import ('./updateQueryWithSummaryFiltersHookBody').hookBody;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore({
      content: initialContentState,
    });

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hookBody = (require('./updateQueryWithSummaryFiltersHookBody').hookBody);
  });

  it('sets correct location if there was match in the navigation state', () => {
    const mockMatch = {} as any;
    jest.spyOn(navigation, 'match')
      .mockReturnValue(mockMatch);
    jest.spyOn(navigation, 'query')
      .mockReturnValue({ modal: 'SG' });

    store.dispatch(setSummaryFilters({ colors: Array.from(colorfilterLabels) }));

    hookBody(helpers)(updateSummaryFilters({ colors: { new: [], remove: [HighlightColorEnum.Green] } }));

    expect(dispatch).toHaveBeenCalledWith(replace(mockMatch, {
      search: 'colors=yellow&colors=blue&colors=purple&modal=SG',
    }));
  });

  it('adds filters to query for setDefaultFilters', () => {
    const mockMatch = {} as any;
    jest.spyOn(navigation, 'match')
      .mockReturnValue(mockMatch);
    jest.spyOn(navigation, 'query')
      .mockReturnValue({ modal: 'SG' });

    store.dispatch(setSummaryFilters({ colors: Array.from(colorfilterLabels) }));

    hookBody(helpers)(setDefaultSummaryFilters({ colors: [HighlightColorEnum.Green], locationIds: ['module-id'] }));

    expect(dispatch).toHaveBeenCalledWith(replace(mockMatch, {
      search: 'colors=green&locationIds=module-id&modal=SG',
    }));
  });

  it('noops if match wansn\'t in the navigation state', () => {
    jest.spyOn(navigation, 'match')
      .mockReturnValue(undefined);

    hookBody(helpers)(updateSummaryFilters({ colors: { new: [], remove: [HighlightColorEnum.Green] } }));

    expect(dispatch).not.toHaveBeenCalled();
  });
});
