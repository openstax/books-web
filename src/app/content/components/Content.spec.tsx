import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader, {
  book,
  shortPage
} from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import MainContent from '../../components/MainContent';
import MobileScrollLock from '../../components/MobileScrollLock';
import ScrollOffset from '../../components/ScrollOffset';
import SkipToContentWrapper from '../../components/SkipToContentWrapper';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { AppServices, AppState, Store } from '../../types';
import { openToc } from '../actions';
import { openMobileToolbar } from '../search/actions';
import { Book } from '../types';
import { formatBookData } from '../utils';
import Content from './Content';
import { TableOfContents } from './TableOfContents';

describe('content', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  const services = {} as AppServices;
  const bookState: Book = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    store = createTestStore({
      navigation: new URL(
        'https://localhost/books/book-slug-1/pages/doesnotmatter'
      ),
    });
    state = store.getState();

    archiveLoader = mockArchiveLoader();
    (services as any).archiveLoader = archiveLoader;
  });

  it('matches snapshot', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders empty state', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('does not focus main content on initial load (a11y)', () => {
    const {tree} = renderToDom(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Content />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const wrapper = ReactTestUtils.findRenderedComponentWithType(tree, Content);

    console.log(wrapper.props);

    if (!window) {
      expect(window).toBeTruthy();
    } else if (!wrapper) {
      expect(wrapper).toBeTruthy();
    } else {
      const mainContent = (wrapper as unknown) as HTMLElement;
      const spyFocus = jest.spyOn(mainContent, 'focus');
      expect(spyFocus).toHaveBeenCalledTimes(0);
    }
  });

  it('provides the right scroll offset when mobile search collapsed', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const scrollOffset = component.root.findByType(ScrollOffset);

    expect(scrollOffset.props).toMatchInlineSnapshot(`
            Object {
              "desktopOffset": 12,
              "mobileOffset": 10,
            }
        `);
  });

  it('provides the right scroll offset when mobile search collapsed', () => {
    store.dispatch(openMobileToolbar());

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const scrollOffset = component.root.findByType(ScrollOffset);

    expect(scrollOffset.props).toMatchInlineSnapshot(`
      Object {
        "desktopOffset": 12,
        "mobileOffset": 15.3,
      }
    `);
  });

  it('gets page content out of cached archive query', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledTimes(1);
    expect(archiveLoader.mock.cachedPage).toHaveBeenCalledWith(
      'testbook1-uuid',
      '1.0',
      'testbook1-testpage4-uuid'
    );
  });

  it('page element is still rendered if archive content is unavailable', () => {
    state.content.book = bookState;
    state.content.page = shortPage;

    archiveLoader.mock.cachedPage.mockReturnValue(undefined);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const pageComponent = component.root.findByProps({ id: 'main-content' });

    expect(pageComponent).toBeDefined();
  });

  it('renders with ToC in null state', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tableOfContentsComponent = component.root.findByType(TableOfContents);

    expect(tableOfContentsComponent.props.isOpen).toBe(null);
  });

  it('clicking overlay closes toc', () => {
    renderer.act(() => {
      store.dispatch(openToc());
    });

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tableOfContentsComponent = component.root.findByType(TableOfContents);
    const mobileScrollLock = component.root.findByType(MobileScrollLock);

    expect(tableOfContentsComponent.props.isOpen).toBe(true);
    renderer.act(() => {
      mobileScrollLock.props.onClick();
    });
    expect(tableOfContentsComponent.props.isOpen).toBe(false);
  });

  it('SidebarControl opens and closes ToC', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(null);

    renderer.act(() => {
      component.root
        .findByProps({ 'aria-label': 'Click to close the Table of Contents' })
        .props.onClick();
    });

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(false);

    renderer.act(() => {
      component.root
        .findByProps({ 'aria-label': 'Click to open the Table of Contents' })
        .props.onClick();
    });

    expect(component.root.findByType(TableOfContents).props.isOpen).toBe(true);
  });
});
