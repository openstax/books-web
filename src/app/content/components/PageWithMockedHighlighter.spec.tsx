import UntypedHighlighter, { SerializedHighlight as UntypedSerializedHighlight } from '@openstax/highlighter';
import keyBy from 'lodash/fp/keyBy';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader, { book, page } from '../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../test/mocks/highlight';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import { resetModules } from '../../../test/utils';
import AccessibilityButtonsWrapper from '../../components/AccessibilityButtonsWrapper';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { locationChange } from '../../navigation/actions';
import { scrollTarget } from '../../navigation/selectors';
import { AppServices, MiddlewareAPI, Store } from '../../types';
import { assertDocument, assertWindow } from '../../utils';
import { receivePage } from '../actions';
import {
  clearFocusedHighlight,
  focusHighlight,
  receiveDeleteHighlight,
  receiveHighlights,
  requestDeleteHighlight,
} from '../highlights/actions';
import * as requestDeleteHighlightHook from '../highlights/hooks/requestDeleteHighlight';
import { initialState } from '../reducer';
import { formatBookData } from '../utils';
import ConnectedPage from './Page';
import allImagesLoaded from './utils/allImagesLoaded';

jest.mock('./utils/allImagesLoaded', () => jest.fn());
jest.mock('../highlights/components/utils/showConfirmation', () => () => new Promise((resolve) => resolve(false)));

// https://github.com/facebook/jest/issues/936#issuecomment-463644784
jest.mock('../../domUtils', () => ({
  // remove cast to any when the jest type is updated to include requireActual()
  ...(jest as any).requireActual('../../domUtils'),
  scrollTo: jest.fn(),
}));

jest.mock('@openstax/highlighter');

UntypedHighlighter.prototype.eraseAll = jest.fn();
UntypedHighlighter.prototype.erase = jest.fn();
UntypedHighlighter.prototype.highlight = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
const fromApiResponse = UntypedSerializedHighlight.fromApiResponse = jest.fn();

describe('Page', () => {
  let archiveLoader: ReturnType<typeof mockArchiveLoader>;
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
    resetModules();
    jest.resetAllMocks();

    // scrollIntoView is not implemented in jsdom
    (assertWindow() as any).HTMLElement.prototype.scrollIntoView = () => jest.fn();

    (allImagesLoaded as any as jest.SpyInstance).mockReturnValue(Promise.resolve());

    store = createTestStore({
      content: {
        ...initialState,
        book: formatBookData(book, mockCmsBook),
        page,
      },
    });
    dispatch = jest.spyOn(store, 'dispatch');

    const testServices = createTestServices();

    services = {
      ...testServices,
      dispatch: store.dispatch,
      getState: store.getState,
    };
    archiveLoader = testServices.archiveLoader;
  });

  const renderDomWithReferences = () => {
    const pageWithRefereces = {
      ...page,
      content: `
        some text
        <a href="/content/link">some link</a>
        some more text
        <a href="./rando/link">another link</a>
        some more text
        text
        <button>asdf</button>
        text
        <a href="">link with empty href</a>
        <a href="#hash">hash link</a>
      `,
    };
    archiveLoader.mockPage(book, pageWithRefereces, 'unused?1');

    store.dispatch(receivePage({...pageWithRefereces, references: [
      {
        match: '/content/link',
        params: {
          book: {
            slug: 'book-slug-1',
          } ,
          page: {
            slug: 'page-title',
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      },
    ]}));

    return renderToDom(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
              <AccessibilityButtonsWrapper>
                <ConnectedPage />
              </AccessibilityButtonsWrapper>
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
  };

  it('removes a highlight that was a scroll target highlight and clears navigations\'s state', async() => {
    const window = assertWindow();
    const spyReplaceState = jest.spyOn(window.history, 'replaceState');
    const mockScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: 'scroll-target-id' })}`;

    renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const highlightsScrollTargetElement = assertDocument().createElement('span');
    const mockHighlights = [
      {
        ...createMockHighlight(),
        elements: [highlightsScrollTargetElement],
        id: 'scroll-target-id',
      },
    ] as any[];

    Highlighter.mock.instances[1].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[1].getOrderedHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[1].getHighlight.mockImplementation(
      (id: string) => keyBy('id', mockHighlights)[id]
    );
    fromApiResponse.mockImplementation((highlight) => highlight);

    renderer.act(() => {
      store.dispatch(locationChange({
        action: 'REPLACE',
        location: { hash: 'hash-of-scroll-target', search: mockScrollTarget },
      } as any));
      store.dispatch(receiveHighlights({ highlights: mockHighlights, pageId: page.id, }));
    });

    // page lifecycle hooks
    await Promise.resolve();

    expect(mockHighlights[0].addFocusedStyles).toHaveBeenCalled();
    expect(scrollTarget(store.getState())).toEqual({
      elementId: 'hash-of-scroll-target',
      id: 'scroll-target-id',
      type: 'highlight',
    });

    const actionData = requestDeleteHighlight(
      mockHighlights[0], { locationFilterId: 'does-not-matter', pageId: page.id }
    );

    renderer.act(() => {
      store.dispatch(actionData);
    });

    renderer.act(() => {
      requestDeleteHighlightHook.hookBody(
        {...services, getState: store.getState, dispatch: store.dispatch}
      )(actionData);
    });

    expect(dispatch).toHaveBeenCalledWith(receiveDeleteHighlight(mockHighlights[0], expect.anything()));
    expect(spyReplaceState).toHaveBeenCalledWith(null, '', window.location.origin + window.location.pathname);
    expect(scrollTarget(store.getState())).toEqual(null);
  });

  // tslint:disable-next-line: max-line-length
  it('scrolls to the Highlight Scroll Target > select another highlight > refresh > do not scroll to the HST again', async() => {
    const mockScrollTarget = `target=${JSON.stringify({ type: 'highlight', id: 'scroll-target-id' })}`;

    renderDomWithReferences();

    // page lifecycle hooks
    await Promise.resolve();

    const highlightsScrollTargetElement = assertDocument().createElement('span');
    const spyHSTScrollIntoView = jest.spyOn(highlightsScrollTargetElement, 'scrollIntoView');
    const anotherHighlightElement = assertDocument().createElement('span');
    const mockHighlights = [
      {
        ...createMockHighlight(),
        elements: [highlightsScrollTargetElement],
        id: 'scroll-target-id',
      },
      {
        ...createMockHighlight(),
        elements: [anotherHighlightElement],
        id: 'another-highlight',
      },
    ] as any[];

    Highlighter.mock.instances[1].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[1].getHighlight.mockImplementation(
      (id: string) => keyBy('id', mockHighlights)[id]
    );
    fromApiResponse.mockImplementation((highlight) => highlight);

    renderer.act(() => {
      store.dispatch(locationChange({
        action: 'REPLACE',
        location: { hash: 'hash-of-scroll-target', search: mockScrollTarget },
      } as any));
      store.dispatch(receiveHighlights({ highlights: mockHighlights, pageId: page.id, }));
    });

    // page lifecycle hooks
    await Promise.resolve();

    expect(mockHighlights[0].addFocusedStyles).toHaveBeenCalled();
    expect(spyHSTScrollIntoView).toHaveBeenCalled();

    renderer.act(() => {
      store.dispatch(clearFocusedHighlight());
    });

    // page lifecycle hooks
    await Promise.resolve();

    renderer.act(() => {
      store.dispatch(focusHighlight(mockHighlights[1].id));
    });

    // page lifecycle hooks
    await Promise.resolve();

    expect(mockHighlights[1].addFocusedStyles).toHaveBeenCalled();
    expect(spyHSTScrollIntoView).toHaveBeenCalledTimes(1);
  });
});
