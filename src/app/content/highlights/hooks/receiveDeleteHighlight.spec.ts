import { Highlight } from '@openstax/highlighter/dist/api';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { FirstArgumentType, MiddlewareAPI, Store } from '../../../types';
import { CustomApplicationError } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

const createMockHighlight = () => ({
  id: Math.random().toString(36).substring(7),
}) as FirstArgumentType<typeof createHighlight>;

describe('receiveDeleteHighlight', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof import ('./receiveDeleteHighlight').hookBody>;
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

    hook = (require('./receiveDeleteHighlight').hookBody)(helpers);
  });

  it('deletes highlight', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockResolvedValue({} as any);

    hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    await Promise.resolve();

    expect(deleteHighlightClient).toHaveBeenCalledWith({id: highlight.id});
  });

  it('doesn\'t call highlightClient when reverting creation', async() => {
    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight');

    hook(receiveDeleteHighlight(highlight as unknown as Highlight, {...meta, revertingAfterFailure: true}));
    await Promise.resolve();

    expect(deleteHighlightClient).not.toHaveBeenCalled();
  });

  it('reverts deletion if it failed', async() => {
    const error = {} as any;

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(error);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(createHighlight(highlight, {...meta, revertingAfterFailure: true}));
    }
  });

  it('throws HighlightDeleteError', async() => {
    const error = {} as any;

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(error);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(error.messageKey).toBe(toastMessageKeys.higlights.failure.delete);
      expect(error.meta).toEqual({ destination: 'page' });
    }
  });

  it('throws CustomApplicationError', async() => {
    const mockCustomApplicationError = new CustomApplicationError('error');

    const deleteHighlightClient = jest.spyOn(helpers.highlightClient, 'deleteHighlight')
      .mockRejectedValue(mockCustomApplicationError);

    try {
      await hook(receiveDeleteHighlight(highlight as unknown as Highlight, meta));
    } catch (error) {
      expect(deleteHighlightClient).toHaveBeenCalled();
      expect(error instanceof CustomApplicationError).toBe(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });
});
