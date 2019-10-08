import { setHead } from './actions';
import reducer, { initialState } from './reducer';

describe('head reducer', () => {
  const action = setHead({
    links: [
      {rel: 'canonical', href: '../test-url'},
    ],
    meta: [
      {property: 'prop', content: 'content'},
    ],
    title: 'cool title',
  });

  it('reduces title', () => {
    const newState = reducer(initialState, action);
    expect(newState.title).toEqual('cool title');
  });

  it('reduces meta', () => {
    const newState = reducer(initialState, action);
    expect(newState.meta).toContainEqual({property: 'prop', content: 'content'});
  });
});
