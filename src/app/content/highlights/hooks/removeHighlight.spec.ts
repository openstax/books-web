import { Highlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastNotifications } from '../../../notifications/selectors';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { createHighlight, deleteHighlight } from '../actions';

jest.mock('../../../../helpers/Sentry');

const createMockHighlight = () => ({
  id: Math.random().toString(36).substring(7),
}) as FirstArgumentType<typeof createHighlight>;

describe('removeHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./removeHighlight').hookBody>;
  let highlight: ReturnType<typeof createMockHighlight>;
  let dispatch: jest.SpyInstance;

  const meta = {locationFilterId: 'id', pageId: 'id'};

  beforeEach(() => {
    store = createTestStore();

    highlight = createMockHighlight();
    store.dispatch(createHighlight(highlight, meta));

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = (require('./removeHighlight').hookBody)(helpers);
  });

  it('deletes highlight', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockResolvedValue({} as any);

    hook(deleteHighlight(highlight as unknown as Highlight, meta));
    await Promise.resolve();

    expect(deleteHighlightClient).toHaveBeenCalledWith({id: highlight.id});
  });

  it('doesn\'t call highlightClient when reverting creation', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    hook(deleteHighlight(highlight as unknown as Highlight, {...meta, revertingAfterFailure: true}));
    await Promise.resolve();

    expect(deleteHighlightClient).not.toHaveBeenCalled();
  });

  it('reverts deletion if it failed', async() => {
    const error = {} as any;

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(error);

    hook(deleteHighlight(highlight as unknown as Highlight, meta));
    await Promise.resolve();

    expect(deleteHighlightClient).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);

    expect(dispatch).toHaveBeenCalledWith(createHighlight(highlight, {...meta, revertingAfterFailure: true}));

    const hasAdequateErrorToast = toastNotifications(store.getState())
      .some((notification) => notification.messageKey === 'i18n:notification:toast:highlights:delete-failure');

    expect(hasAdequateErrorToast).toBe(true);
  });
});
