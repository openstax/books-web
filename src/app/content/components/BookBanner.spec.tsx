import { DOMRect } from '@openstax/types/lib.dom';
import React from 'react';
import renderer from 'react-test-renderer';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import { resetModules } from '../../../test/utils';
import { assertDocument, assertWindow } from '../../utils';
import { formatBookData } from '../utils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import { BarWrapper, PropTypes } from './BookBanner';
import { defaultTheme } from './constants';

const book = formatBookData(archiveBook, mockCmsBook);
const bookWithoutOsWebData = formatBookData(archiveBook, undefined);
const pageNode = findArchiveTreeNodeById(archiveBook.tree, shortPage.id)!;

describe('BookBanner', () => {
  let window: Window;
  let event: React.MouseEvent;
  let assign: jest.SpyInstance;
  // tslint:disable-next-line:variable-name
  let BookBanner: React.ComponentType<PropTypes>;

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
    beforeEach(() => {
      BookBanner = require('./BookBanner').BookBanner;
    });

    it('renders empty state with no page or book', () => {
      const component = renderer.create(<BookBanner bookTheme={defaultTheme} />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly when you pass a page and book', () => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} bookTheme={book.theme} />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders BookTitle instead of BookTitleLink with a link to details page for retired books', () => {
      const component = renderer.create(<BookBanner
        pageNode={pageNode}
        book={{...book, book_state: 'retired'}}
        bookTheme={book.theme}
      />);

      expect(() => component.root.findByProps({ 'data-testid': 'book-title-expanded'})).not.toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'book-title-collapsed'})).not.toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'details-link-expanded'})).toThrow();
      expect(() => component.root.findByProps({ 'data-testid': 'details-link-collapsed'})).toThrow();
    });

    it('renders correctly without osweb data', () => {
      const component = renderer.create(<BookBanner
        pageNode={pageNode}
        book={bookWithoutOsWebData}
        bookTheme={defaultTheme}
      />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly without pageNode', () => {
      const component = renderer.create(<BookBanner book={book} bookTheme={defaultTheme} />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('does not stop default navigation event', async() => {
      const component = renderer.create(<BookBanner
        pageNode={pageNode}
        book={book}
        bookTheme={book.theme}
        hasUnsavedHighlight={false}
      />);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('mounts in a dom', () => {
      expect(() => renderToDom(<BookBanner pageNode={pageNode} book={book} bookTheme={book.theme} />)).not.toThrow();
    });

    it('wrapper transition matches snapshot', () => {
      const component = renderer.create(<BarWrapper colorSchema='blue' up={true} />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('defaults tab indexes on banner links', () => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} bookTheme={book.theme} />);

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

      // scroll handler also gets called on component did mount
      const rectSpy = jest.spyOn(collapsedBannerNode, 'getBoundingClientRect')
        .mockReturnValueOnce({top: 50} as DOMRect);

      const component = renderer.create(
        <BookBanner pageNode={pageNode} book={book} bookTheme={book.theme}/>,
        {createNodeMock}
      );

      const linkExpanded = component.root.findByProps({'data-testid': 'details-link-expanded'});
      const linkCollapsed = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      const scrollEvent = window.document.createEvent('UIEvents');
      scrollEvent.initEvent('scroll', true, false);

      // first scroll
      rectSpy.mockReturnValueOnce({top: 0} as DOMRect);
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

    beforeEach(() => {
      BookBanner = require('./BookBanner').BookBanner;
    });

    it('redirects if users chooses to discard', async() => {
      const component = renderer.create(<BookBanner
        pageNode={pageNode}
        book={book}
        bookTheme={book.theme}
        hasUnsavedHighlight={true}
      />);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).toHaveBeenCalled();
    });

    it('noops if users chooses not to discard', async() => {
      const component = renderer.create(<BookBanner
        pageNode={pageNode}
        book={book}
        bookTheme={book.theme}
        hasUnsavedHighlight={true}
      />);

      const link = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
    });
  });
});
