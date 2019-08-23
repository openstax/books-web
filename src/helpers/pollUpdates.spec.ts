import { updateAvailable } from '../app/notifications/actions';
import { Store } from '../app/types';
import { assertDocument } from '../app/utils';
import createTestStore from '../test/createTestStore';
import { resetModules } from '../test/utils';
import { Cancel, trustAfter } from './pollUpdates';

const mockFetchResponse = (code: number, data: any) => Promise.resolve({
  json: () => Promise.resolve(data),
  status: code,
  text: () => Promise.resolve(data),
});

const mockFetch = (code: number, data: any) => jest.fn(() => mockFetchResponse(code, data));

describe('poll updates', () => {
  let cancel: Cancel;
  const fetchBackup = fetch;
  let store: Store;
  let fetchSpy: jest.SpyInstance;
  let dispatch: jest.SpyInstance;
  const dateBackup = Date;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    fetchSpy = (global as any).fetch = mockFetch(200, {
      configs: {
        google_analytics: [
          'UA-0000000-1',
        ],
      },
      release_id: 'releaseid',
    });

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
    resetModules();
    (global as any).fetch = fetchBackup;
    (global as any).Date = dateBackup;
  });

  describe('in production', () => {
    let pollUpdates: typeof import ('./pollUpdates').default;
    let googleAnalyticsClient: typeof import ('../gateways/googleAnalyticsClient').default;

    beforeEach(() => {
      jest.mock('../config', () => ({
        APP_ENV: 'production',
        RELEASE_ID: 'releaseid',
      }));
      jest.resetModules();
      pollUpdates = require('./pollUpdates').default;
      googleAnalyticsClient = require('../gateways/googleAnalyticsClient').default;
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

      (Date as any).prototype.getTime.mockReturnValue((new dateBackup()).getTime() + trustAfter * 1.5);
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

    it('initializes google analytics', async() => {
      const mock = jest.fn(() => ({}));
      googleAnalyticsClient.setTrackingIds = mock;

      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch

      expect(mock).toHaveBeenCalledWith(['UA-0000000-1']);
    });

    it('initializes google analytics', async() => {
      const mock = jest.fn(() => ({}));
      googleAnalyticsClient.setTrackingIds = mock;

      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch

      expect(mock).toHaveBeenCalledWith(['UA-0000000-1']);
    });

    it('doesn\'t initialize google analytics when there are no ids', async() => {
      fetchSpy.mockReturnValue(mockFetchResponse(200, {
        configs: {
          google_analytics: [
          ],
        },
        release_id: 'releaseid',
      }));
      const mock = jest.fn(() => ({}));
      googleAnalyticsClient.setTrackingIds = mock;

      cancel = pollUpdates(store);
      jest.runOnlyPendingTimers();

      await Promise.resolve(); // clear promise queue for the async poll function
      await Promise.resolve(); // clear promise queue for the mockfetch

      expect(mock).not.toHaveBeenCalled();
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
  let poll: typeof import ('./pollUpdates').poll;
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
