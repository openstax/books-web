import React from 'react';
import { book, page } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import createApp from '../index';
import { Match } from '../navigation/types';
import { AppServices } from '../types';
import { content } from './routes';

describe('content route', () => {
  it('generates a url', () => {
    const url = content.getUrl({book: 'book', page: 'page'});
    expect(url).toEqual('/books/book/pages/page');
  });

  describe('route renders', () => {
    const windowBackup = window;
    const documentBackup = document;
    let renderer: any;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      renderer = require('react-test-renderer');
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('renders a component', () => {
      const services = {
      } as AppServices;

      const params = {
        book: mockCmsBook.meta.slug,
        page: 'test-page-1',
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
});
