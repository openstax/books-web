import { SearchResultHit, SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client';
import { ArchiveBook, ArchivePage } from '../app/content/types';
import * as mockArchive from './mocks/archiveLoader';

export const makeSearchResultHit = (
  {book, page, highlights, sourceId}: {
    book: ArchiveBook,
    page: ArchivePage,
    highlights?: string[],
    sourceId?: string,
  } = {
    book: mockArchive.book,
    page: mockArchive.page,
  }
): SearchResultHit => ({
  highlight: { visibleContent: highlights || ['cool <strong>highlight</strong> bruh'] },
  index: `${book.id}@${book.version}_i1`,
  score: 2,
  source: {
    elementId: sourceId || 'fs-id1544727',
    elementType: SearchResultHitSourceElementTypeEnum.Paragraph,
    pageId: `${page.id}@${page.version}`,
    pagePosition: 60,
  },
});

export const makeSearchResults = (hits: SearchResultHit[] = [makeSearchResultHit()]) => ({
  hits: { hits, total: hits.length },
  overallTook: 75,
  shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
  timedOut: false,
  took: 0,
});
