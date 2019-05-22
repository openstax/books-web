import { createMemoryHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { combineReducers, createStore } from 'redux';
import ConnectedSidebar, { Sidebar } from '.';
import { book as archiveBook, page, shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import createReducer from '../../../navigation/reducer';
import { AppState, Store } from '../../../types';
import * as actions from '../../actions';
import contentReducer, { initialState } from '../../reducer';
import { formatBookData } from '../../utils';
import { expandCurrentChapter, scrollTocSectionIntoView } from '../../utils/domUtils';

const book = formatBookData(archiveBook, mockCmsBook);

jest.mock('../../utils/domUtils');

describe('Sidebar', () => {
  let store: Store;

  beforeEach(() => {
    const state = {
      content: {
        ...initialState,
        book, page,
      },
    } as any as AppState;
    const history = createMemoryHistory();
    const navigation = createReducer(history.location);
    store = createStore(combineReducers({content: contentReducer, navigation}), state);
  });

  it('expands and scrolls to current chapter', () => {
    renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(expandCurrentChapter).not.toHaveBeenCalled();
    expect(scrollTocSectionIntoView).toHaveBeenCalledTimes(1);

    store.dispatch(actions.receivePage({...shortPage, references: []}));

    expect(expandCurrentChapter).toHaveBeenCalled();
    expect(scrollTocSectionIntoView).toHaveBeenCalledTimes(2);
  });

  it('opens and closes', () => {
    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    expect(component.root.findByType(Sidebar).props.isOpen).toBe(null);
    store.dispatch(actions.closeToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(false);
    store.dispatch(actions.openToc());
    expect(component.root.findByType(Sidebar).props.isOpen).toBe(true);
  });

  it('resets toc on navigate', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>);

    component.root.findAllByType('a')[0].props.onClick({preventDefault: () => null});
    expect(dispatchSpy).toHaveBeenCalledWith(actions.resetToc());
  });

  it('resizes on scroll', () => {
    if (!document || !window) {
      expect(window).toBeTruthy();
      return expect(document).toBeTruthy();
    }

    const render = () => <MessageProvider><Provider store={store}>
      <ConnectedSidebar />
    </Provider></MessageProvider>;

    const {node} = renderToDom(render());
    const spy = jest.spyOn(node.style, 'setProperty');

    const event = document.createEvent('UIEvents');
    event.initEvent('scroll', true, false);
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith('height', expect.anything());
  });
});
