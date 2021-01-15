import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import * as helpers from './applicationUpdates';
import Sentry from './Sentry';

describe('serviceWorkerNeedsUpdate', () => {
  it('says no if there isnt one', () => {
    expect(helpers.serviceWorkerNeedsUpdate(undefined)).toBe(false);
  });

  it('says no if there is already one waiting', () => {
    const sw = {waiting: {}} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(false);
  });

  it('says no if there is already one installed', () => {
    const sw = {installing: {}} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(false);
  });

  it('says yes to other cases', () => {
    const sw = {} as ServiceWorkerRegistration;
    expect(helpers.serviceWorkerNeedsUpdate(sw)).toBe(true);
  });
});

describe('findAndInstallServiceWorkerUpdate', () => {
  it('noops if it sw is already waiting', () => {
    const cb = jest.fn();
    const sw = {waiting: {}, update: jest.fn() as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;
    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    expect(cb).toHaveBeenCalled();
    expect(sw.update).not.toHaveBeenCalled();
  });

  it('handles installing sw', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const serviceWorker = {
      addEventListener: addEventListener as ServiceWorker['addEventListener'],
      removeEventListener: removeEventListener as ServiceWorker['removeEventListener'],
      state: 'installing',
    };
    const sw = {
      installing: serviceWorker,
      update: update as ServiceWorkerRegistration['update'],
    };

    let stateChangeHandler: () => void = () => null;
    addEventListener.mockImplementation((_event, handler) => stateChangeHandler = handler);

    helpers.findAndInstallServiceWorkerUpdate(sw as ServiceWorkerRegistration, cb);

    expect(addEventListener).toHaveBeenCalledWith('statechange', expect.anything());

    serviceWorker.state = 'installed';
    stateChangeHandler();

    expect(removeEventListener).toHaveBeenCalledWith('statechange', stateChangeHandler);
    expect(cb).toHaveBeenCalled();
    expect(sw.update).not.toHaveBeenCalled();
  });

  it('handles update error', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const sw = {update: update as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;
    const captureException = jest.spyOn(Sentry, 'captureException').mockImplementation(() => null);

    let failUpdate: (e: Error) => void = () => null;
    update.mockReturnValue(new Promise((_resolve, reject) => failUpdate = reject));

    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    const error = new Error('asdfasdf');
    failUpdate(error);

    await Promise.resolve();

    expect(cb).toHaveBeenCalled();
    expect(sw.update).toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledWith(error);
  });

  it('after update, if not installing, callback immediately', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const sw = {update: update as ServiceWorkerRegistration['update']} as ServiceWorkerRegistration;

    let finishUpdate: () => void = () => null;
    update.mockReturnValue(new Promise<void>((resolve) => finishUpdate = resolve));

    helpers.findAndInstallServiceWorkerUpdate(sw, cb);

    finishUpdate();

    await Promise.resolve();

    expect(cb).toHaveBeenCalled();
    expect(sw.update).toHaveBeenCalled();
  });

  it('after update, if installing, waits for installed', async() => {
    const cb = jest.fn();
    const update = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const serviceWorker = {
      addEventListener: addEventListener as ServiceWorker['addEventListener'],
      removeEventListener: removeEventListener as ServiceWorker['removeEventListener'],
      state: 'installing',
    };
    const sw = {
      installing: undefined as typeof serviceWorker | undefined,
      update: update as ServiceWorkerRegistration['update'],
    };

    let finishUpdate: () => void = () => null;
    update.mockReturnValue(new Promise<void>((resolve) => finishUpdate = resolve));

    let stateChangeHandler: () => void = () => null;
    addEventListener.mockImplementation((_event, handler) => stateChangeHandler = handler);

    helpers.findAndInstallServiceWorkerUpdate(sw as ServiceWorkerRegistration, cb);

    expect(sw.update).toHaveBeenCalled();

    sw.installing = serviceWorker;
    finishUpdate();
    await Promise.resolve();

    expect(addEventListener).toHaveBeenCalledWith('statechange', expect.anything());

    stateChangeHandler();

    expect(cb).not.toHaveBeenCalled();

    serviceWorker.state = 'installed';
    stateChangeHandler();

    expect(cb).toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledWith('statechange', stateChangeHandler);
  });
});

describe('activateSwAndReload', () => {
  let reload: jest.SpyInstance;

  beforeEach(() => {
    reload = jest.spyOn(assertWindow().location, 'reload').mockImplementation(() => null);
  });

  afterEach(() => {
    reload.mockClear();
  });

  it('if there is no waiting sw just reload', () => {
    helpers.activateSwAndReload(undefined)();
    expect(reload).toHaveBeenCalled();
  });

  it('posts SKIP_WAITING and waits for activation before reloading', () => {
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const postMessage = jest.fn();
    const serviceWorker = {
      addEventListener: addEventListener as ServiceWorker['addEventListener'],
      postMessage: postMessage as ServiceWorker['postMessage'],
      removeEventListener: removeEventListener as ServiceWorker['removeEventListener'],
      state: 'waiting',
    };
    const sw = {
      waiting: serviceWorker,
    };

    let stateChangeHandler: () => void = () => null;
    addEventListener.mockImplementation((_event, handler) => stateChangeHandler = handler);

    helpers.activateSwAndReload(sw as ServiceWorkerRegistration)();

    expect(postMessage).toHaveBeenCalledWith({type: 'SKIP_WAITING'});

    stateChangeHandler();
    expect(reload).not.toHaveBeenCalled();

    serviceWorker.state = 'activating';
    stateChangeHandler();

    expect(reload).toHaveBeenCalled();
  });
});
