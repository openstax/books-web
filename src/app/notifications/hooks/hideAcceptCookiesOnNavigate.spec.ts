import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import { locationChange } from '../../navigation/actions';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import { acceptCookies, dismissNotification } from '../actions';
import { hideAcceptCookiesOnNavigateHookBody } from './hideAcceptCookiesOnNavigate';

describe('hideAcceptCookiesOnNavigate', () => {
  const location = { hash: '', pathname: '', search: '', state: {}, };
  const dummyLocationChange = locationChange({location, action: 'PUSH'});

  let store: Store;
  let dispatch: jest.SpyInstance;
  let helpers: MiddlewareAPI & AppServices;
  let hook: ReturnType<typeof hideAcceptCookiesOnNavigateHookBody>;

  beforeEach(() => {
    jest.resetAllMocks();

    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    hook = hideAcceptCookiesOnNavigateHookBody(helpers);
  });

  it('when the accept cookies popup is up, finds and dismisses it', async() => {
    store.dispatch(acceptCookies());
    await hook(dummyLocationChange);
    expect(dispatch).toHaveBeenCalledWith(dismissNotification(acceptCookies()));
  });

  it('when the accept cookies popup is NOT up, does nothing', async() => {
    await hook(dummyLocationChange);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
