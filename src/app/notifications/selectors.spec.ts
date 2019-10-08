import createTestStore from '../../test/createTestStore';
import { locationChange } from '../navigation/actions';
import { Store } from '../types';
import { assertWindow } from '../utils';
import { receiveMessages } from './actions';
import { appMessageType } from './reducer';
import { notificationsForDisplay } from './selectors';

describe('notifications', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  const setPath = (path: string) => {
    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        pathname: path,
        state: {},
      },
      match: undefined,
    }));
  };

  it('filters notifications by path rexex', () => {
    setPath('/coolpath');
    const matchingMessages = [
      {
        dismissable: false,
        end_at: null,
        html: 'asdf',
        id: '1',
        start_at: null,
        url_regex: null,
      },
      {
        dismissable: false,
        end_at: null,
        html: 'asdf',
        id: '1',
        start_at: null,
        url_regex: '/cool',
      },
    ];
    const notMachingMessages = [
      {
        dismissable: false,
        end_at: null,
        html: 'asdf',
        id: '1',
        start_at: null,
        url_regex: '/path',
      },
    ];
    store.dispatch(receiveMessages([
      ...notMachingMessages,
      ...matchingMessages,
    ]));

    expect(notificationsForDisplay(store.getState())).toEqual(
      matchingMessages.map((payload) => ({payload, type: appMessageType})).slice(0, 1)
    );
  });
});
