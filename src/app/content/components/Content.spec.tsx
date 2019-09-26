import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import {
  book,
  shortPage
} from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import MobileScrollLock from '../../components/MobileScrollLock';
import ScrollOffset from '../../components/ScrollOffset';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { openToc, receiveBook, receivePage } from '../actions';
import { openMobileToolbar } from '../search/actions';
import { Book } from '../types';
import { formatBookData } from '../utils';
import Content from './Content';
import { TableOfContents } from './TableOfContents';

describe('content', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  const bookState: Book = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    store = createTestStore({
      navigation: new URL(
        'https://localhost/books/book-slug-1/pages/doesnotmatter'
      ),
    });
    services = createTestServices();
  });

  it('matches snapshot', () => {
    store.dispatch(receiveBook(bookState));
    store.dispatch(receivePage({...shortPage, references: []}));

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
    store.dispatch(receiveBook(bookState));
    store.dispatch(receivePage({...shortPage, references: []}));

    renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Content />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    expect(services.archiveLoader.mock.cachedPage).toHaveBeenCalledTimes(1);
    expect(services.archiveLoader.mock.cachedPage).toHaveBeenCalledWith(
      'testbook1-uuid',
      '1.0',
      'testbook1-testpage4-uuid'
    );
  });

  it('page element is still rendered if archive content is unavailable', () => {
    store.dispatch(receiveBook(bookState));
    store.dispatch(receivePage({...shortPage, references: []}));

    services.archiveLoader.mock.cachedPage.mockReturnValue(undefined);

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
