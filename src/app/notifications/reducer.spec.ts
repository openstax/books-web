import flow from 'lodash/fp/flow';
import * as actions from './actions';
import reducer, { appMessageType, initialState } from './reducer';

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
});
