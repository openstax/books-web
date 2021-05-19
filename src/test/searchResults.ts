import { SearchResultHit, SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client';
import { ArchiveBook, ArchivePage, ArchiveTreeSection } from '../app/content/types';
import { getIdVersion, stripIdVersion } from '../app/content/utils/idUtils';
import * as mockArchive from './mocks/archiveLoader';

const isArchivePage = (thing: ArchivePage | ArchiveTreeSection): thing is ArchivePage =>
  !!(thing as ArchivePage).revised;

export const makeSearchResultHit = (
  {book, page, highlights, sourceId, elementType, title}: {
    book: ArchiveBook,
    elementType?: SearchResultHitSourceElementTypeEnum,
    page: ArchivePage | ArchiveTreeSection,
    highlights?: string[],
    sourceId?: string,
    title?: string,
  } = {
    book: mockArchive.book,
    page: mockArchive.page,
  }
): SearchResultHit => ({
  highlight: { title, visibleContent: highlights || ['cool <strong>highlight</strong> bruh'] },
  index: `${book.id}@${book.version}_i1`,
  score: 2,
  source: {
    elementId: sourceId || 'fs-id1544727',
    elementType: elementType || SearchResultHitSourceElementTypeEnum.Paragraph,
    pageId: `${stripIdVersion(page.id)}@${isArchivePage(page) ? '1.0' : getIdVersion(page.id)}`,
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
