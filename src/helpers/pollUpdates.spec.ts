import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import createTestStore from '../test/createTestStore';
import pollUpdatesType, { Cancel, poll as pollType, trustAfter } from './pollUpdates';

const mockFetch = (code: number, data: any) => jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
}));

describe('poll updates', () => {
  let cancel: Cancel;
  const fetchBackup = fetch;
  let store: Store;
  let dispatch: jest.SpyInstance;
  const dateBackup = Date;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    (global as any).fetch = mockFetch(200, {release_id: 'releaseid'});

    function MockDate() {
      return null;
    }
    MockDate.prototype.getTime = jest.fn(() => (new dateBackup()).getTime());
    (global as any).Date = MockDate;
  });

  afterEach(() => {
    if (cancel) {
      cancel();
    } else {
      throw new Error('test did not set its cancel function, probably leaking timers');
    }
    jest.resetModules();
    (global as any).fetch = fetchBackup;
    (global as any).Date = dateBackup;
  });

  describe('in production', () => {
    let pollUpdates: typeof pollUpdatesType;

    beforeEach(() => {
      jest.resetModules();
      jest.mock('../config', () => ({
        APP_ENV: 'production',
        RELEASE_ID: 'releaseid',
      }));
      pollUpdates = require('./pollUpdates').default;
    });

    it('fetches /rex/environment.json imeediately', () => {
      cancel = pollUpdates(store);
      expect(fetch).toHaveBeenCalledWith('/rex/environment.json');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('fetches /rex/environment.json at an interval', () => {
      cancel = pollUpdates(store);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(4);
      expect(fetch).toHaveBeenNthCalledWith(2, '/rex/environment.json');
      expect(fetch).toHaveBeenNthCalledWith(3, '/rex/environment.json');
      expect(fetch).toHaveBeenNthCalledWith(4, '/rex/environment.json');
    });

    it('doesn\'t dispatch if release differs from built release until specified time elapses', async() => {
      (global as any).fetch = mockFetch(200, {release_id: 'releaseid2'});
      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue
      await Promise.resolve(); // clear promise queue
      await Promise.resolve(); // clear promise queue

      expect(dispatch).not.toHaveBeenCalled();

      (Date as any).prototype.getTime.mockReturnValue((new dateBackup()).getTime() + trustAfter);
      // make date be 1h in the future

      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue
      await Promise.resolve(); // clear promise queue
      await Promise.resolve(); // clear promise queue

      expect(dispatch).toHaveBeenCalledWith(updateAvailable());
    });

    it('dispatches updateAvailable if release changes', async() => {

      cancel = pollUpdates(store);
      (global as any).fetch = mockFetch(200, {release_id: 'releaseid2'});
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch

      expect(dispatch).toHaveBeenCalledWith(updateAvailable());
    });

    it('does nothing while focus is away', async() => {
      const document = assertDocument();
      const event = document.createEvent('Event');
      event.initEvent('visibilitychange', true, true);

      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();
      expect(fetch).toHaveBeenCalledTimes(2);

      Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
      document.dispatchEvent(event);

      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('polls immediatley when focus comes back', async() => {
      const document = assertDocument();
      const event = document.createEvent('Event');
      event.initEvent('visibilitychange', true, true);

      cancel = pollUpdates(store);
      expect(fetch).toHaveBeenCalledTimes(1);

      Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
      document.dispatchEvent(event);
      Object.defineProperty(document, 'visibilityState', {value: 'visible'});
      document.dispatchEvent(event);

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('outside production', () => {
    const pollUpdates = require('./pollUpdates').default;

    it('does nothing', () => {
      cancel = pollUpdates(store);
      jest.runAllTimers();
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});

describe('poll', () => {
  const fetchBackup = fetch;
  let poll: typeof pollType;
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    (global as any).fetch = mockFetch(200, {release_id: 'releaseid'});
    jest.mock('../config', () => ({
      RELEASE_ID: 'releaseid',
    }));
    poll = require('./pollUpdates').poll;
  });

  afterEach(() => {
    (global as any).fetch = fetchBackup;
  });

  it('does nothing if error is returned', async() => {
    (global as any).fetch = jest.fn(() => Promise.reject());
    let message: undefined | string;

    try {
      await poll(store)();
    } catch (e) {
      message = e.message;
    }

    expect(dispatch).not.toHaveBeenCalled();
    expect(message).toBeUndefined();
  });
});
