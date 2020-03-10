import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import noop from 'lodash/fp/noop';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { resetModules } from '../../../../test/utils';
import { MiddlewareAPI, Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import {
  closeMyHighlights,
  openMyHighlights,
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  setSummaryFilters,
  toggleSummaryHighlightsLoading,
} from '../actions';
import { maxHighlightsApiPageSize } from '../constants';
import { HighlightData, SummaryHighlights } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

const locationIds = ['testbook1-testpage1-uuid', 'testbook1-testchapter1-uuid'];

const page1 = Array.from(new Array(210).keys()).map((index) => ({
  id: 'highlight' + index,
  sourceId: 'testbook1-testpage1-uuid',
})) as HighlightData[];

const page2 = Array.from(new Array(5).keys()).map((index) => ({
  id: 'highlight' + (210 + index),
  sourceId: 'testbook1-testpage2-uuid',
})) as HighlightData[];

describe('printHighlights', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let print: jest.SpyInstance;
  let hook: typeof import ('./printHighlights').asyncHelper;

  beforeEach(() => {
    resetModules();
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);

    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(openMyHighlights());

    hook = (require('./printHighlights').asyncHelper);
  });

  describe('with unfetched resources', () => {
    beforeEach(() => {
      store.dispatch(receiveHighlightsTotalCounts({
        'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 210},
        'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
      }, new Map()));
      store.dispatch(setSummaryFilters({locationIds}));
    });

    it('fetches all highlights before print', async() => {
      const firstFetch = page1.slice(0, 200);
      const secondFetch = [...page1.slice(200), ...page2];

      const response: SummaryHighlights = {
        'testbook1-testchapter1-uuid': {
          'testbook1-testpage2-uuid': page2,
        },
        'testbook1-testpage1-uuid': {
          'testbook1-testpage1-uuid': page1,
        },
      };

      const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockReturnValueOnce(Promise.resolve({
          data: firstFetch,
          meta: {
            page: 1,
            perPage: maxHighlightsApiPageSize,
            totalCount: page1.length + page2.length,
          },
        }))
        .mockReturnValueOnce(Promise.resolve({
          data: secondFetch,
          meta: {
            page: 2,
            perPage: maxHighlightsApiPageSize,
            totalCount: page1.length + page2.length,
          },
        }))
      ;
      await hook(helpers);
      expect(highlightClient).toHaveBeenCalledTimes(2);

      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(response, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(print).toHaveBeenCalled();
    });

    it('doesn\'t trigger print if myhighlights are closed', async() => {
      store.dispatch(receiveSummaryHighlights({
        'testbook1-testchapter1-uuid': {
          'testbook1-testpage2-uuid': page2,
        },
        'testbook1-testpage1-uuid': {
          'testbook1-testpage1-uuid': page1,
        },
      }, {pagination: null}));
      store.dispatch(closeMyHighlights());

      await hook(helpers);

      expect(print).not.toHaveBeenCalled();
    });

    it('uses pagination from previous requests', async() => {
      const firstFetch = page1.slice(105);
      const secondFetch = page2;

      const response: SummaryHighlights = {
        'testbook1-testchapter1-uuid': {
          'testbook1-testpage2-uuid': secondFetch,
        },
        'testbook1-testpage1-uuid': {
          'testbook1-testpage1-uuid': firstFetch,
        },
      };

      const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
        .mockReturnValueOnce(Promise.resolve({
          data: firstFetch,
          meta: {
            page: 2,
            perPage: 105,
            totalCount: page1.length,
          },
        }))
        .mockReturnValueOnce(Promise.resolve({
          data: secondFetch,
          meta: {
            page: 1,
            perPage: maxHighlightsApiPageSize,
            totalCount: page2.length,
          },
        }))
      ;

      // meant to immitate fetched highlights before triggering print
      store.dispatch(receiveSummaryHighlights({
          'testbook1-testpage1-uuid': {
            'testbook1-testpage1-uuid': page1.slice(0, 105),
          },
        }, {
        pagination: {
          page: 1,
          perPage: 105,
          sourceIds: locationIds,
        },
      }));

      await hook(helpers);
      expect(highlightClient).toHaveBeenCalledTimes(2);

      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights(response, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));
      expect(print).toHaveBeenCalled();
    });
  });

  describe('with all resources fetched', () => {
    it('doesn\'t call highlight client', async() => {
      const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights');

      await hook(helpers);

      expect(highlightClient).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(receiveSummaryHighlights({}, {
        isStillLoading: true,
        pagination: null,
      }));
      expect(dispatch).toHaveBeenCalledWith(toggleSummaryHighlightsLoading(false));

      expect(print).toHaveBeenCalled();
    });
  });
});
