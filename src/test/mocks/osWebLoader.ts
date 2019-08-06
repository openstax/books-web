import { OSWebBook } from '../../gateways/createOSWebLoader';

export const mockCmsBook: OSWebBook = {
  authors: [{value: {name: 'Bam Bammerson'}}],
  cnx_id: '3',
  cover_color: 'blue',
  meta: {
    slug: 'book-slug-1',
  },
  publish_date: '2012-06-21',
};

export default () => ({
  getBookFromId: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookFromSlug: jest.fn(() => Promise.resolve(mockCmsBook)),
  getBookIdFromSlug: jest.fn(() => Promise.resolve('testbook1-uuid')),
  getBookSlugFromId: jest.fn(() => Promise.resolve('book-slug-1')),
});
