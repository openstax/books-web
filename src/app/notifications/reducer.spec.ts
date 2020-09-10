import flow from 'lodash/fp/flow';
import * as actions from './actions';
import reducer, { appMessageType, initialState } from './reducer';
import { ToastNotification } from './types';

describe('notifications reducer', () => {
  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState.modalNotifications).toContainEqual(actions.updateAvailable());
    expect(newState.toastNotifications).toEqual([]);
  });

  it('doesn\'t duplicate update available notification', () => {
    const state = {...initialState, modalNotifications: [actions.updateAvailable()]};
    const newState = reducer(state, actions.updateAvailable());
    expect(newState).toBe(state);
  });

  it('doesn\'t duplicate app messages', () => {
    const messages = [
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '1',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '2',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
    ];
    const newMessages = [
      {
        payload: {
          dismissable: false,
          end_at: null,
          html: 'asdf',
          id: '3',
          start_at: null,
          url_regex: null,
        },
        type: appMessageType,
      },
    ];
    const newState = reducer({...initialState, modalNotifications: messages}, actions.receiveMessages([
      ...messages.slice(1).map(({payload}) => payload),
      ...newMessages.map(({payload}) => payload),
    ]));
    expect(newState.modalNotifications.length).toBe(3);
    expect(newState.modalNotifications).toEqual([...messages, ...newMessages]);
    expect(newState.toastNotifications).toEqual([]);
  });

  it('dismissesNotification', () => {
    const acceptCookiesNotification = actions.acceptCookies();

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state, acceptCookiesNotification),
      (state) => reducer(state, actions.dismissNotification(acceptCookiesNotification))
    )(initialState);

    expect(newState.modalNotifications).not.toContainEqual(actions.acceptCookies());
    expect(newState.toastNotifications).toEqual([]);
  });

  it('reduces acceptCookies', () => {
    const newState = reducer(initialState, actions.acceptCookies());
    expect(newState.modalNotifications).toContainEqual(actions.acceptCookies());
    expect(newState.toastNotifications).toEqual([]);
  });

  describe('toast notifications', () => {
    it('reduces toasts', () => {
      const newState = flow(
        (state) => reducer(state, actions.addToast('mytoast')),
        (state) => reducer(state, actions.addToast('myothertoast'))
      )(initialState);

      expect(newState.modalNotifications).toEqual([]);
      expect(newState.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'mytoast'}));
      expect(newState.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'myothertoast'}));
    });

    it('refreshes the timestamp if a toast with the same message appears', async() => {
      const newState = reducer(initialState, actions.addToast('mytoast'));
      const toast = newState.toastNotifications.find((notification) => notification.messageKey === 'mytoast');

      if (!toast) {
        return expect(toast).toBeTruthy();
      }
      await new Promise((res) => setTimeout(res, 5));

      const initialTimestamp = toast.timestamp;
      const state = reducer(newState, actions.addToast('mytoast'));

      expect(state.toastNotifications).toContainEqual(expect.objectContaining({messageKey: 'mytoast'}));
      expect(state.toastNotifications.length).toBe(1);
      expect(state.toastNotifications).not.toContainEqual(expect.objectContaining({timestamp: initialTimestamp}));
    });

    it('keeps the toasts in correct order', () => {
      const isPreceededByNewerOrNothing = (toast: ToastNotification, index: number, toasts: ToastNotification[]) =>
        toasts[index - 1] === undefined || toasts[index - 1].timestamp >= toast.timestamp;

      const newState = flow(
        (state) => reducer(state, actions.addToast('mytoast')),
        (state) => reducer(state, actions.addToast('myothertoast')),
        (state) => reducer(state, actions.addToast('myamazingtoast')),
        (state) => reducer(state, actions.addToast('mytoast')),
        (state) => reducer(state, actions.addToast('myothertoast'))
      )(initialState);

      const [newest] = newState.toastNotifications;

      expect(newState.toastNotifications.every(isPreceededByNewerOrNothing)).toBe(true);
      expect(newest.messageKey).toBe('myothertoast');
    });
  });
});
