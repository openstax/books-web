import flow from 'lodash/fp/flow';
import * as actions from './actions';
import reducer, { appMessageType, initialState } from './reducer';

describe('notifications reducer', () => {

  it('adds update available notification', () => {
    const newState = reducer(initialState, actions.updateAvailable());
    expect(newState).toContainEqual(actions.updateAvailable());
  });

  it('doesn\'t duplicate update available notification', () => {
    const state = [actions.updateAvailable()];
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
    const newState = reducer(messages, actions.receiveMessages([
      ...messages.slice(1).map(({payload}) => payload),
      ...newMessages.map(({payload}) => payload),
    ]));
    expect(newState.length).toBe(3);
    expect(newState).toEqual([...messages, ...newMessages]);
  });

  it('dismissesNotification', () => {
    const acceptCookiesNotification = actions.acceptCookies();

    const newState = flow(
      (state) => reducer(state, actions.updateAvailable()),
      (state) => reducer(state, acceptCookiesNotification),
      (state) => reducer(state, actions.dismissNotification(acceptCookiesNotification))
    )(initialState);

    expect(newState).not.toContainEqual(actions.acceptCookies());
  });

  it('reduces acceptCookies', () => {
    const newState = reducer(initialState, actions.acceptCookies());
    expect(newState).toContainEqual(actions.acceptCookies());
  });
});
