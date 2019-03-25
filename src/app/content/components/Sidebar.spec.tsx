import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import MessageProvider from '../../MessageProvider';
import createReducer from '../../navigation/reducer';
import { AppState } from '../../types';
import * as actions from '../actions';
import contentReducer, { initialState } from '../reducer';
import ConnectedSidebar, { Sidebar } from './Sidebar';

const book = {
  id: 'booklongid',
  shortId: 'book',
  slug: 'someslug',
  title: 'book title',
  tree: {
    contents: [
      {
        id: 'pagelongid',
        shortId: 'page',
        title: 'page title',
      },
      {
        id: 'pagelongid2',
        shortId: 'page2',
        title: 'page title2',
      },
    ],
    id: 'booklongid',
    shortId: 'book',
    title: 'book title',
  },
  version: '0',
};
const page = {
  id: 'pagelongid',
  shortId: 'page',
  title: 'page title',
  version: '0',
};

describe('Sidebar', () => {
  it('opens and closes', () => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    const history = createMemoryHistory();
    const navigation = createReducer(history.location);
    const store = createStore(combineReducers({content: contentReducer, navigation}), state);

    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(null);
    store.dispatch(actions.closeToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    store.dispatch(actions.openToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });
});
