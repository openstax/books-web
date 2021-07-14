import { HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import { IntlShape } from 'react-intl';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { assertDocument } from '../../../utils';
import * as routes from '../../routes';
import { formatBookData } from '../../utils';
import { ContentLinkProp } from './contentLinkHandler';

const book = {
  ...formatBookData(archiveBook, mockCmsBook),
  id: 'longidin-vali-dfor-mat1-111111111111',
};

describe('contentLinkHandler', () => {
  let handler: (e: MouseEvent) => Promise<void>;
  let prop: ContentLinkProp;
  let anchor: HTMLAnchorElement;
  let intl: IntlShape;

  beforeEach(() => {
    resetModules();
    anchor = assertDocument().createElement('a');
    intl = { formatMessage: jest.fn() } as any as IntlShape;

    prop = {
      book,
      currentPath: '/asdf',
      focusedHighlight: '',
      hasUnsavedHighlight: false,
      locationState: {} as any,
      navigate: jest.fn(),
      page,
      references: [],
    };
  });

  describe('without unsaved highlight', () => {
    let contentRoute: typeof routes['content'];

    beforeEach(() => {
      contentRoute = require('../../routes').content;
      handler = require('./contentLinkHandler').contentLinkHandler(anchor, () => prop, intl);
    });

    it('intercepts clicking content links with uuid', async() => {
      const link = `/books/${book.id}@${book.version}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            uuid: book.id,
            version: book.version,
          },
          page: {
            slug: 'page-title',
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalledWith({
        params: {
          book: {
            uuid: book.id,
            version: book.version,
          },
          page: {
            slug: 'page-title',
          },
        },
        route: contentRoute,
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }, expect.anything());
    });

    it('intercepts clicking content links with slug', async() => {
      const link = `/books/${book.slug}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalledWith({
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
        route: contentRoute,
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }, expect.anything());
    });

    it('intercepts clicking content links with book and page uuid', async() => {
      const pageId = book.id;
      const link = `/books/${book.id}@${book.version}/pages/${pageId}`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            uuid: book.id,
            version: book.version,
          },
          page: {
            uuid: pageId,
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalledWith({
        params: {
          book: {
            uuid: book.id,
            version: book.version,
          },
          page: {
            uuid: pageId,
          },
        },
        route: contentRoute,
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }, expect.anything());
    });

    it('intercepts clicking content links that failed to load due to reference loading error', async() => {
      const link = `/books/${book.slug}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        type: 'error',
      }];

      const event = {
        preventDefault: jest.fn(),
      };

      await handler(event as any);

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();
    });

    it('requires two clicks for links with highlights', async() => {
      const testHighlightID = 'randomid';

      const highlight = assertDocument().createElement('span');
      highlight.setAttribute('data-highlight-id', testHighlightID);

      const link = `/books/${book.slug}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }];

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: highlight,
      };

      await handler(event as any);

      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();

      prop.focusedHighlight = testHighlightID;
      event.preventDefault.mockClear();

      await handler(event as any);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalledWith({
        params: {
          book: {
            slug: book.slug,
          },
          page: {
            slug: 'page-title',
          },
        },
        route: contentRoute,
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }, expect.anything());
    });
  });

  describe('with unsaved highlight', () => {
    let event: any;
    const mockConfirmation = jest.fn()
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(false), 300)))
      .mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(true), 300)));

    jest.mock(
      '../../highlights/components/utils/showConfirmation',
      () => mockConfirmation
    );

    beforeEach(() => {
      prop.hasUnsavedHighlight = true;

      handler = require('./contentLinkHandler').contentLinkHandler(anchor, () => prop, intl);

      const link = `/books/${book.id}@${book.version}/pages/page-title`;
      anchor.setAttribute('href', link);
      prop.references = [{
        match: link,
        params: {
          book: {
            uuid: book.id,
            version: book.version,
          },
          page: {
            slug: 'page-title',
          },
        },
        state: {
          bookUid: 'book',
          bookVersion: 'version',
          pageUid: 'page',
        },
      }];

      event = {
        preventDefault: jest.fn(),
      };
    });

    it('noops if user chooses not to discard', async() => {
      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockConfirmation).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).not.toHaveBeenCalled();
    });

    it('intercepts clicking if user chooses to discard', async() => {
      await handler(event as any);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockConfirmation).toHaveBeenCalled();

      await new Promise((resolve) => defer(resolve));

      expect(prop.navigate).toHaveBeenCalled();
    });
  });
});
