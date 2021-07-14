import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { initialState as initialContentState } from '../../content/reducer';
import { content } from '../../content/routes';
import { modalUrlName } from '../../content/studyGuides/constants';
import { MiddlewareAPI, Store } from '../../types';
import { assertWindow } from '../../utils';
import { locationChange } from '../actions';

describe('openModal', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hookFactory: typeof import ('./openModalHook').openModal;
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

    hookFactory = (require('./openModalHook').openModal);
  });

  it('sets correct location if there was match in the navigation state', () => {
    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        pathname: '/books/book-slug-1/pages/doesnotmatter',
        state: {},
      },
      match: {
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
        route: content,
        state: {},
      },
    }));
    const hook = hookFactory('myModalName')(helpers);

    hook();

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        search: 'modal=myModalName',
      }),
    }));
  });

  it('keeps colors and locationIds from query for SG modal', () => {
    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        pathname: '/books/book-slug-1/pages/doesnotmatter',
        search: 'colors=yellow&locationIds=module-id',
        state: {},
      },
      match: {
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
        route: content,
        state: {},
      },
    }));
    const hook = hookFactory(modalUrlName)(helpers);

    hook();

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        search: `colors=yellow&locationIds=module-id&modal=${modalUrlName}`,
      }),
    }));
  });

  it('noops if match wansn\'t in the navigation state', () => {
    const hook = hookFactory('myModalName')(helpers);

    hook();

    expect(dispatch).not.toHaveBeenCalled();
  });
});
