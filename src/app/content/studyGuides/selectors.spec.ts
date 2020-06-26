import { treeWithoutUnits } from '../../../test/trees';
import { book } from '../selectors';
import * as select from './selectors';

const mockBook = book as any as jest.SpyInstance;

jest.mock('../selectors', () => ({
  book: jest.fn(),
  localState: (state: any) => ({studyGuides: state}),
  page: jest.fn(),
}));

describe('studyGuidesLocationFiltersWithContent', () => {
  it('filters', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.studyGuidesLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: {page1: { blue: 1 }, page2: { pink: 3 }, preface: { yellow: 2 }},
      },
    } as any)).toEqual(new Set(['chapter1', 'preface']));
  });

  it('works with null counts', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    expect(select.studyGuidesLocationFiltersWithContent({
      summary: {
        totalCountsPerPage: null,
      },
    } as any)).toEqual(new Set());
  });

  it('works with empty location filters', () => {
    mockBook.mockReturnValue({id: 'enabledbook', tree: treeWithoutUnits});
    const state = { summary: { filters: { locationIds: undefined }}} as any;
    expect(select.summaryLocationFilters(state)).toEqual(new Set());
  });
});
