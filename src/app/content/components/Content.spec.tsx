import React from 'react';
import { Provider } from 'react-redux';
import renderer, { ReactTestInstance } from 'react-test-renderer';
import { createStore } from 'redux';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import { setStateFinished } from '../../../test/reactutils';
import * as Services from '../../context/Services';
import { AppServices, AppState } from '../../types';
import { initialState } from '../reducer';
import Content, { ContentComponent } from './Content';
import Page from './Page';
import { Sidebar } from './Sidebar';

describe('content', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  const services = {} as AppServices;

  beforeEach(() => {
    archiveLoader = mockArchiveLoader();
    (services as any).archiveLoader = archiveLoader;
    state = {
      content: {
        ...initialState,
        book: {
          ...book,
          slug: 'book-slug-1',
        },
        page,
      },
    } as unknown as AppState;
  });

  it('matches snapshot', () => {
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders empty state', () => {
    state = {
      content: initialState,
    } as any as AppState;
    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('gets page content out of cached archive query', () => {
    const store = createStore((s: AppState | undefined) => s || state, state);

    renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledTimes(1);
    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledWith('testbook1-uuid', '1.0', 'testbook1-testpage1-uuid');
  });

  it('page element is still rendered if archive content is unavailable', () => {
    const store = createStore((s: AppState | undefined) => s || state, state);
    archiveLoader.mock.cachedPage.mockReturnValue(undefined);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const pageComponent = component.root.findByType(Page);

    expect(pageComponent).toBeDefined();
  });

  it('updates after initial render', async() => {
    const state1 = {
      content: initialState,
    } as any as AppState;
    const state2 = state;

    const go = {type: 'go'};

    const reducer = (_: AppState | undefined, action?: typeof go) => action && action.type === 'go'
      ? state2
      : state1;

    const store = createStore(reducer, state1);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const before = component.toJSON();
    store.dispatch(go);

    const target = component.root.findByType(ContentComponent) as ReactTestInstance;
    await setStateFinished(target);

    const after = component.toJSON();
    expect(before).not.toEqual(after);
  });

  it('renders with ToC open', () => {
    state = {
      content: initialState,
    } as any as AppState;

    const store = createStore((s: AppState | undefined) => s || state, state);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <Content />
      </Services.Provider>
    </Provider>);

    const sidebarComponent = component.root.findByType(Sidebar);

    expect(sidebarComponent.props.isOpen).toBe(true);
  });
});
