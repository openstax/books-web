import { Document } from '@openstax/types/lib.dom';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import * as mathjax from '../../../helpers/mathjax';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import SkipToContentWrapper from '../../components/SkipToContentWrapper';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { push } from '../../navigation/actions';
import { AppServices, AppState, MiddlewareAPI, Store } from '../../types';
import { scrollTo } from '../../utils';
import { assertWindow } from '../../utils';
import * as actions from '../actions';
import { initialState } from '../reducer';
import * as routes from '../routes';
import { formatBookData } from '../utils';
import ConnectedPage from './Page';
import allImagesLoaded from './utils/allImagesLoaded';

jest.mock('./utils/allImagesLoaded', () => jest.fn());

// https://github.com/facebook/jest/issues/936#issuecomment-463644784
jest.mock('../../utils', () => ({
  // remove cast to any when the jest type is updated to include requireActual()
  ...(jest as any).requireActual('../../utils'),
  scrollTo: jest.fn(),
}));

describe('Page', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let state: AppState;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    (allImagesLoaded as any as jest.SpyInstance).mockReturnValue(Promise.resolve());

    store = createTestStore({
      content: {
        ...initialState,
        book: formatBookData(book, mockCmsBook),
        page,
      },
    });
    state = store.getState();

    const testServices = createTestServices();

    services = {
      ...testServices,
      dispatch: store.dispatch,
      getState: store.getState,
    };
    dispatch = jest.spyOn(store, 'dispatch');
    archiveLoader = testServices.archiveLoader;
  });

  const renderDomWithReferences = () => {
    archiveLoader.mockPage(book, {
      ...page,
      content: `
        some text
        <a href="/content/link">some link</a>
        some more text
        <a href="/rando/link">another link</a>
        text
        <button>asdf</button>
        text
        <a href="">link with empty href</a>
      `,
    });

    state.content.references = [
      {
        match: '/content/link',
        params: {
          book: 'book-slug-1',
          page: 'page-title',
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      },
    ];
    return renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <Services.Provider value={services}>
            <SkipToContentWrapper>
              <ConnectedPage />
            </SkipToContentWrapper>
          </Services.Provider>
        </MessageProvider>
      </Provider>
    );
  };

  describe('Content tweaks for generic styles', () => {
    const htmlHelper = (html: string) => {
      archiveLoader.mock.cachedPage.mockImplementation(() => ({
        ...page,
        content: html,
      }));
      const {root} = renderToDom(
        <Provider store={store}>
          <MessageProvider>
            <Services.Provider value={services}>
              <SkipToContentWrapper>
                <ConnectedPage />
              </SkipToContentWrapper>
            </Services.Provider>
          </MessageProvider>
        </Provider>
      );
      const pageElement = root.querySelector('#main-content');

      if (!pageElement) {
        return expect(pageElement).toBeTruthy();
      }
      return pageElement.innerHTML;
    };

    it('wraps note titles in a <header> and contents in a <section>', () => {
      expect(htmlHelper('<div data-type="note"><div data-type="title">TT</div><p>BB</p></div>'))
      .toEqual('<div data-type="note" class="ui-has-child-title">' +
      '<header><div data-type="title">TT</div></header><section><p>BB</p></section></div>');
    });

    it('adds a label to the note when present', () => {
      expect(htmlHelper('<div data-type="note" data-label="LL"><div data-type="title">notetitle</div></div>'))
      .toEqual('<div data-type="note" data-label="LL" class="ui-has-child-title">' +
      '<header><div data-type="title" data-label-parent="LL">notetitle</div></header>' +
      '<section></section></div>');
    });

    it('converts notes without titles', () => {
      expect(htmlHelper('<div data-type="note">notewithouttitle</div>'))
      .toEqual('<div data-type="note"><header></header><section>notewithouttitle</section></div>');
    });

    it('moves figure captions to the bottom', () => {
      expect(htmlHelper('<figure><figcaption>CC</figcaption>FF</figure>'))
      .toEqual('<figure class="ui-has-child-figcaption">FF<figcaption>CC</figcaption></figure>');
    });

    it('adds (target="_blank" rel="noopener nofollow") to external links', () => {
      expect(htmlHelper('<a href="https://openstax.org/external-url">external-link</a>'))
      .toEqual('<a target="_blank" rel="noopener nofollow" href="https://openstax.org/external-url">external-link</a>');
    });

    it('numbers lists that have a start attribute', () => {
      expect(htmlHelper('<ol start="123"><li>item</li></ol>'))
      .toEqual('<ol start="123" style="counter-reset: list-item 123"><li>item</li></ol>');
    });

    it('adds prefix to list items', () => {
      expect(htmlHelper('<ol data-mark-prefix="[mark-prefix]"><li>item</li></ol>'))
      .toEqual('<ol data-mark-prefix="[mark-prefix]"><li data-mark-prefix="[mark-prefix]">item</li></ol>');
    });

    it('adds a suffix to list items', () => {
      expect(htmlHelper('<ol data-mark-suffix="[mark-suffix]"><li>item</li></ol>'))
      .toEqual('<ol data-mark-suffix="[mark-suffix]"><li data-mark-suffix="[mark-suffix]">item</li></ol>');
    });

    it('updates content self closing tags', () => {
      expect(htmlHelper(`<strong data-somethin="asdf"/>asdf<iframe src="someplace"/>`)).toEqual(
        '<strong data-somethin="asdf"></strong>asdf<iframe src="someplace"></iframe>'
      );
    });

    it('moves (first-child) figure and table ids up to the parent div', () => {
      expect(htmlHelper(`
        <div class="os-figure">
          <figure id="figure-id1">
            <span data-alt="Something happens." data-type="media" id="span-id1">
              <img alt="Something happens." data-media-type="image/png" id="img-id1" src="/resources/hash" width="300">
            </span>
          </figure>
          <div class="os-caption-container">
            <span class="os-title-label">Figure </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span class="os-caption">Some explanation about the image. (credit: someone)</span>
          </div>
        </div>

        <div class="os-table">
          <table summary="Table 1.1 Something" id="table-id1" class="some-class">
            <thead>
              <tr>
                <th scope="col"><strong>Column 1</strong></th>
                <th scope="col"><strong>Column 2</strong></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Value 1</td>
                <td>Value 2</td>
              </tr>
            </tbody>
          </table>
          <div class="os-caption-container">
            <span class="os-title-label">Table </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span data-type="title" class="os-title">Something</span>
            <span class="os-divider"> </span>
          </div>
        </div>
      `)).toEqual(`
        <div class="os-figure" id="figure-id1">
          <figure data-id="figure-id1">
            <span data-alt="Something happens." data-type="media" id="span-id1">
              <img alt="Something happens." data-media-type="image/png" id="img-id1" src="/resources/hash" width="300">
            </span>
          </figure>
          <div class="os-caption-container">
            <span class="os-title-label">Figure </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span class="os-caption">Some explanation about the image. (credit: someone)</span>
          </div>
        </div>

        <div class="os-table" id="table-id1">
          <table summary="Table 1.1 Something" data-id="table-id1" class="some-class">
            <thead>
              <tr>
                <th scope="col"><strong>Column 1</strong></th>
                <th scope="col"><strong>Column 2</strong></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Value 1</td>
                <td>Value 2</td>
              </tr>
            </tbody>
          </table>
          <div class="os-caption-container">
            <span class="os-title-label">Table </span>
            <span class="os-number">1.1</span>
            <span class="os-divider"> </span>
            <span data-type="title" class="os-title">Something</span>
            <span class="os-divider"> </span>
          </div>
        </div>
      `);
    });

  });

  it('updates content link with new hrefs', () => {
    const {root} = renderDomWithReferences();
    const [firstLink, secondLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!firstLink || !secondLink) {
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
    }

    expect(firstLink.getAttribute('href')).toEqual('books/book-slug-1/pages/page-title');
    expect(secondLink.getAttribute('href')).toEqual('/rando/link');
  });

  it('interceptes clicking content links', () => {
    const {root} = renderDomWithReferences();
    const [firstLink, secondLink, thirdLink] = Array.from(root.querySelectorAll('#main-content a'));
    const button = root.querySelector('#main-content button');

    if (!document || !firstLink || !secondLink || !thirdLink || !button) {
      expect(document).toBeTruthy();
      expect(firstLink).toBeTruthy();
      expect(secondLink).toBeTruthy();
      expect(thirdLink).toBeTruthy();
      expect(button).toBeTruthy();
      return;
    }

    const makeEvent = (doc: Document) => {
      const event = doc.createEvent('MouseEvents');
      event.initEvent('click', true, false);
      event.preventDefault();
      event.preventDefault = jest.fn();
      return event;
    };

    const evt1 = makeEvent(document);
    const evt2 = makeEvent(document);
    const evt3 = makeEvent(document);
    const evt4 = makeEvent(document);

    firstLink.dispatchEvent(evt1);
    secondLink.dispatchEvent(evt2);
    thirdLink.dispatchEvent(evt3);
    button.dispatchEvent(evt4);

    expect(evt1.preventDefault).toHaveBeenCalled();
    expect(evt2.preventDefault).not.toHaveBeenCalled();
    expect(evt3.preventDefault).not.toHaveBeenCalled();
    expect(evt4.preventDefault).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(push({
      params: {
        book: 'book-slug-1',
        page: 'page-title',
      },
      route: routes.content,
      state: {
        bookUid: 'book',
        bookVersion: 'version',
        pageUid: 'page',
        search: null,
      },
    }, {
      hash: '',
      search: '',
    }));
  });

  it('does not intercept clicking content links when meta key is pressed', () => {
    const {root} = renderDomWithReferences();
    const [firstLink] = Array.from(root.querySelectorAll('#main-content a'));

    if (!document || !firstLink) {
      expect(document).toBeTruthy();
      expect(firstLink).toBeTruthy();
      return;
    }

    const makeEvent = (doc: Document) => {
      const event = doc.createEvent('MouseEvents');
      event.initMouseEvent('click',
        event.cancelBubble,
        event.cancelable,
        event.view,
        event.detail,
        event.screenX,
        event.screenY,
        event.clientX,
        event.clientY,
        event.ctrlKey,
        event.altKey,
        event.shiftKey,
        true, // metaKey
        event.button,
        event.relatedTarget);
      event.preventDefault = jest.fn();
      return event;
    };

    const evt1 = makeEvent(document);

    firstLink.dispatchEvent(evt1);

    expect(evt1.preventDefault).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('removes listener when it unmounts', () => {
    const { root } = renderDomWithReferences();
    const links = Array.from(root.querySelectorAll('#main-content a'));

    for (const link of links) {
      link.removeEventListener = jest.fn();
    }

    ReactDOM.unmountComponentAtNode(root);

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.removeEventListener).toHaveBeenCalled();
    }
  });

  it('doesn\'t break when trying to remove listeners from elements that have no stored handler', () => {
    const { root } = renderDomWithReferences();
    const pageElement = root.querySelector('#main-content');

    if (pageElement && document) {
      pageElement.append(document.createElement('a'));
      expect(() => ReactDOM.unmountComponentAtNode(root)).not.toThrow();
    } else {
      expect(pageElement).toBeTruthy();
      expect(document).toBeTruthy();
    }
  });

  it('mounts and unmounts without a dom', () => {
    const element = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    expect(element.unmount).not.toThrow();
  });

  it('renders math', () => {
    const typesetMath = jest.spyOn(mathjax, 'typesetMath');
    renderDomWithReferences();
    expect(typesetMath).toHaveBeenCalled();
    typesetMath.mockRestore();
  });

  it('scrolls to top on new content', () => {
    if (!window) {
      return expect(window).toBeTruthy();
    }

    const spy = jest.spyOn(window, 'scrollTo');
    spy.mockImplementation(() => null);

    renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    store.dispatch(actions.receivePage({
      content: 'some other content',
      id: 'adsfasdf',
      references: [],
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    }));

    expect(spy).toHaveBeenCalledWith(0, 0);
  });

  it('waits for images to load before scrolling to a target element', async() => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      content: '<div style="height: 1000px;"></div><img src=""><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.navigation.hash = '#somehash';
    archiveLoader.mockPage(book, someHashPage);

    const {root} = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    let resolveImageLoaded: undefined | ((value?: void | PromiseLike<void> | undefined) => void);
    const allImagesLoadedPromise = new Promise<void>((resolve) => {
      resolveImageLoaded = resolve;
    });

    if (!resolveImageLoaded) {
      return expect(resolveImageLoaded).toBeTruthy();
    }

    (allImagesLoaded as any as jest.SpyInstance).mockReturnValue(allImagesLoadedPromise);

    store.dispatch(actions.receivePage({
      ...someHashPage,
      references: [],
    }));

    await Promise.resolve();

    expect(scrollTo).not.toHaveBeenCalled();

    resolveImageLoaded();
    await Promise.resolve();

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('does not scroll to selected content on initial load', () => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.navigation.hash = '#somehash';
    state.content.page = someHashPage;

    archiveLoader.mockPage(book, someHashPage);

    const {root} = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to selected content on update', async() => {
    if (!document) {
      return expect(document).toBeTruthy();
    }

    const someHashPage = {
      content: '<div style="height: 1000px;"></div><div id="somehash"></div>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.navigation.hash = '#somehash';
    archiveLoader.mockPage(book, someHashPage);

    const {root} = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    expect(scrollTo).not.toHaveBeenCalled();

    store.dispatch(actions.receivePage({
      ...someHashPage,
      references: [],
    }));

    await Promise.resolve();

    const target = root.querySelector('[id="somehash"]');

    expect(target).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith(target);
  });

  it('does nothing when receiving the same content', () => {
    if (!window) {
      return expect(window).toBeTruthy();
    }

    const spy = jest.spyOn(window, 'scrollTo');

    renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    renderer.act(() => {
      store.dispatch(actions.receiveBook(formatBookData(book, mockCmsBook)));
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it('adds scope to table headers', () => {
    const tablePage = {
      content: '<table><thead><tr><th id="coolheading">some heading</th></tr></thead></table>',
      id: 'adsfasdf',
      revised: '2018-07-30T15:58:45Z',
      shortId: 'asdf',
      title: 'qerqwer',
      version: '0',
    };

    state.content.page = tablePage;

    archiveLoader.mockPage(book, tablePage);

    const {root} = renderToDom(
      <Provider store={store}>
        <MessageProvider>
          <SkipToContentWrapper>
            <Services.Provider value={services}>
              <ConnectedPage />
            </Services.Provider>
          </SkipToContentWrapper>
        </MessageProvider>
      </Provider>
    );

    const target = root.querySelector('[id="coolheading"]');

    if (target) {
      expect(target.getAttribute('scope')).toEqual('col');
    } else {
      expect(target).toBeTruthy();
    }
  });

  describe('with prerendered state', () => {
    beforeEach(() => {
      assertWindow().__PRELOADED_STATE__ = state;
    });

    afterEach(() => {
      delete assertWindow().__PRELOADED_STATE__;
    });

    it('uses prerendered content', () => {
      services.prerenderedContent = 'prerendered content';
      archiveLoader.mock.cachedPage.mockImplementation(() => undefined);

      const {root} = renderToDom(
        <Provider store={store}>
          <MessageProvider>
            <SkipToContentWrapper>
              <Services.Provider value={services}>
                <ConnectedPage />
              </Services.Provider>
            </SkipToContentWrapper>
          </MessageProvider>
        </Provider>
      );

      const target = root.querySelector('[id="main-content"]');

      if (!target) {
        return expect(target).toBeTruthy();
      }

      expect(target.innerHTML).toEqual('prerendered content');
    });

    it('defaults to empty page', () => {
      archiveLoader.mock.cachedPage.mockImplementation(() => undefined);

      const {root} = renderToDom(
        <Provider store={store}>
          <MessageProvider>
            <SkipToContentWrapper>
              <Services.Provider value={services}>
                <ConnectedPage />
              </Services.Provider>
            </SkipToContentWrapper>
          </MessageProvider>
        </Provider>
      );

      const target = root.querySelector('[id="main-content"]');

      if (!target) {
        return expect(target).toBeTruthy();
      }

      expect(target.innerHTML).toEqual('');
    });
  });
});
