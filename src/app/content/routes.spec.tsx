import createTestServices from '../../test/createTestServices';
import { book, page } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules } from '../../test/utils';
import { Match } from '../navigation/types';

describe('content route', () => {
  let content: any;
  let React: any; // tslint:disable-line:variable-name
  let renderer: any;
  let createApp: any;

  it('generates a url', () => {
    content = require('./routes').content;
    const url = content.getUrl({book: {slug: 'book'}, page: {slug: 'page'}});
    expect(url).toEqual('/books/book/pages/page');
  });

  it('generates a versioned url', () => {
    content = require('./routes').content;
    const url = content.getUrl({book: {slug: 'book', version: 'asdf'}, page: {slug: 'page'}});
    expect(url).toEqual('/books/book@asdf/pages/page');
  });

  it('generates a url with uuid', () => {
    content = require('./routes').content;
    const url = content.getUrl({
      book: {
        uuid: 'longidin-vali-dfor-mat1-111111111111',
        version: '1.0',
      },
      page: {
        slug: 'page',
      }});
    expect(url).toEqual('/books/longidin-vali-dfor-mat1-111111111111@1.0/pages/page');
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderer} = reactAndFriends());
      content = require('./routes').content;
      createApp = require('../index').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const services = createTestServices();

      const params = {
        book: {
          slug: mockCmsBook.meta.slug,
        },
        page: {
          slug: 'test-page-1',
        },
      };
      const state = {
        bookUid: book.id,
        bookVersion: book.version,
        pageUid: page.id,
      };

      const match: Match<typeof content> = {
        params,
        route: content,
        state,
      };
      const app = createApp({
        initialEntries: [match],
        services,
      });

      const tree = renderer
          .create(<app.container />)
          .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('route content', () => {
    const mockConfig = {BOOKS: {
      [book.id]: {defaultVersion: book.version},
    } as {[key: string]: {defaultVersion: string}}};

    beforeEach(() => {
      jest.doMock('../../config', () => ({...mockConfig, REACT_APP_ARCHIVE_URL: 'some-content'}));
      resetModules();
    });

    it('sets archive url on getSearch', () => {
      expect(require('./routes').content.getSearch()).toEqual('archive=some-content');
    });

  });
});
