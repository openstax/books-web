import { DOMRect } from '@openstax/types/lib.dom';
import { cloneDeep } from 'lodash/fp';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../../test/utils';
import { AppState } from '../../types';
import { assertDocument, assertWindow } from '../../utils';
import { initialState } from '../reducer';
import { formatBookData } from '../utils';
import { BarWrapper } from './BookBanner';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...shortPage, references: []};
const bookWithoutOsWebData = formatBookData(archiveBook, undefined);

describe('BookBanner', () => {
  let window: Window;
  let event: React.MouseEvent;
  let assign: jest.SpyInstance;
  // tslint:disable-next-line:variable-name
  let BookBanner: React.FC;

  beforeEach(() => {
    resetModules();

    window = assertWindow();
    delete (window as any).location;

    window.location = {
      assign: jest.fn(),
    } as any as Window['location'];

    event = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      preventDefault: jest.fn(),
      shiftKey: false,
    } as any as React.MouseEvent;
    assign = jest.spyOn(window.location, 'assign');
  });

  describe('without unsaved changes', () => {
    let React: any; // tslint:disable-line:variable-name
    let renderer: any;
    let TestContainer: any; // tslint:disable-line:variable-name
    let renderToDom: any;

    beforeEach(() => {
      ({React, renderer, TestContainer, renderToDom} = reactAndFriends());
      BookBanner = require('./BookBanner').default;
    });

    it('renders empty state with no page or book', () => {
      const component = renderer.create(<TestContainer><BookBanner /></TestContainer>);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly when you pass a page and book', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders BookTitle instead of BookTitleLink with a link to details page for retired books', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book: {...book, book_state: 'retired'},
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      expect(() => component.root.findByProps({ 'data-testid': 'book-title-expanded'})).not.toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'book-title-collapsed'})).not.toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'details-link-expanded'})).toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'details-link-collapsed'})).toThrow();
    });

    it('renders correctly without osweb data', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book: bookWithoutOsWebData,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly without pageNode', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('does not stop default navigation event', async() => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('mounts in a dom', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      expect(() => renderToDom(<TestContainer store={store}><BookBanner /></TestContainer>)).not.toThrow();
    });

    it('wrapper transition matches snapshot', () => {
      const component = renderer.create(<BarWrapper colorSchema='blue' up={true} />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('defaults tab indexes on banner links', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const linkExpanded = component.root.findByProps({'data-testid': 'details-link-expanded'});
      const linkCollapsed = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      expect(linkExpanded.props.tabIndex).toBe(undefined);
      expect(linkCollapsed.props.tabIndex).toBe(-1);
    });

    it('sets tab indexes on banner links according to scroll', () => {
      const expandedBannerNode = assertDocument().createElement('div');
      const collapsedBannerNode = assertDocument().createElement('div');

      const createNodeMock = (element: any) => {
        const analyticsRegion = element.props['data-testid'];

        if (analyticsRegion === 'bookbanner') {
          return expandedBannerNode;
        }
        if (analyticsRegion === 'bookbanner-collapsed') {
          return collapsedBannerNode;
        }

        return null;
      };

      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>,
        {createNodeMock}
      );

      const linkExpanded = component.root.findByProps({'data-testid': 'details-link-expanded'});
      const linkCollapsed = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      const scrollEvent = window.document.createEvent('UIEvents');
      scrollEvent.initEvent('scroll', true, false);

      // first scroll
      const rectSpy = jest.spyOn(collapsedBannerNode, 'getBoundingClientRect').mockReturnValueOnce({top: 0} as DOMRect);
      renderer.act(() => {
        window.document.dispatchEvent(scrollEvent);
      });

      expect(linkExpanded.props.tabIndex).toBe(-1);
      expect(linkCollapsed.props.tabIndex).toBe(undefined);

      // second scroll
      rectSpy.mockReturnValueOnce({top: 50} as DOMRect);
      renderer.act(() => {
        window.document.dispatchEvent(scrollEvent);
      });

      expect(linkExpanded.props.tabIndex).toBe(undefined);
      expect(linkCollapsed.props.tabIndex).toBe(-1);
    });
  });

  describe('with unsaved changes', () => {
    const mockConfirmation = jest.fn()
      .mockImplementationOnce(() =>  new Promise((resolve) => resolve(true)))
      .mockImplementationOnce(() =>  new Promise((resolve) => resolve(false)));

    jest.mock(
      '../highlights/components/utils/showConfirmation',
      () => mockConfirmation
    );

    let React: any; // tslint:disable-line:variable-name
    let renderer: any;
    let TestContainer: any; // tslint:disable-line:variable-name

    beforeEach(() => {
      ({React, renderer, TestContainer} = reactAndFriends());
      BookBanner = require('./BookBanner').default;
    });

    it('redirects if users chooses to discard', async() => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          highlights: {
            currentPage: {
              hasUnsavedHighlight: true,
            },
          },
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).toHaveBeenCalled();
    });

    it('noops if users chooses not to discard', async() => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          highlights: {
            currentPage: {
              hasUnsavedHighlight: true,
            },
          },
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      const link = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
    });
  });

  describe('outside browser', () => {
    const windowBackup = window;
    const documentBackup = document;
    let React: any; // tslint:disable-line:variable-name
    let renderer: any;
    let TestContainer: any; // tslint:disable-line:variable-name

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      ({React, renderer, TestContainer} = reactAndFriends());
      BookBanner = require('./BookBanner').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders', () => {
      const state = (cloneDeep({
        content: {
          ...initialState,
          book,
          page,
          params: {
            book: {
              slug: book.slug,
            },
            page: {
              slug: page.slug,
            },
          },
        },
      }) as any) as AppState;
      const store = createTestStore(state);
      const component = renderer.create(<TestContainer store={store}><BookBanner /></TestContainer>);

      // tslint:disable-next-line: no-empty
      renderer.act(() => {});

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
