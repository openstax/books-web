import { GetHighlightsSetsEnum, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { ApplicationError } from '../../../../helpers/applicationMessageError';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page as archivePage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { toastMessageKeys } from '../../../notifications/components/ToastNotifications/constants';
import { MiddlewareAPI, Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { HighlightData, SummaryHighlights } from '../../highlights/types';
import { formatBookData } from '../../utils';
import {
  loadMoreStudyGuides,
  receiveStudyGuidesTotalCounts,
  receiveSummaryStudyGuides,
  setSummaryFilters,
  toggleStudyGuidesSummaryLoading,
} from '../actions';
import { colorfilterLabels } from '../constants';
import { summaryFilters } from '../selectors';

const book = formatBookData(archiveBook, mockCmsBook);
const page = {...archivePage, references: []};

const createTestHighlights = ({
  amount,
  startIdsFrom,
  sourceId,
}: {
  amount: number,
  startIdsFrom?: number,
  sourceId: string
}) => Array.from({length: amount}, (_, index) => ({
    id: 'highlight' + (startIdsFrom || 0 + index),
    sourceId,
  })) as HighlightData[];

describe('loadMore', () => {
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let loadingSpy: jest.SpyInstance;
  let hook: ReturnType<typeof import ('./loadMore').hookBody>;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
    loadingSpy = jest.spyOn(require('../../highlights/utils/highlightLoadingUtils'), 'loadUntilPageSize');
    hook = (require('./loadMore').hookBody)(helpers);
  });

  it('fetches multiple pages across multiple sources', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));

    const maxHighlightsApiPageSize = 20;

    const highlightsCount = {
      'testbook1-testpage2-uuid': 15,
      // keep the order of pages as they appear in the used fixture
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': 10,
      'testbook1-testpage8-uuid': 15,
    };

    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: highlightsCount['testbook1-testpage2-uuid']},
      // tslint:disable-next-line: object-literal-sort-keys
      'testbook1-testpage11-uuid': {[HighlightColorEnum.Green]: highlightsCount['testbook1-testpage11-uuid']},
      'testbook1-testpage8-uuid': {[HighlightColorEnum.Green]: highlightsCount['testbook1-testpage8-uuid']},
    }));
    store.dispatch(setSummaryFilters({
      colors: Array.from(colorfilterLabels),
      locationIds: ['testbook1-testchapter1-uuid'],
    }));

    const page1 = createTestHighlights({
      amount: highlightsCount['testbook1-testpage2-uuid'],
      sourceId: 'testbook1-testpage2-uuid',
    });

    const page2 = createTestHighlights({
      amount: maxHighlightsApiPageSize - page1.length,
      sourceId: 'testbook1-testpage11-uuid',
      startIdsFrom: page1.length,
    });

    const highlights = [
      ...page1,
      ...page2,
    ];

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: highlights,
        meta: {
          page: 1,
          perPage: maxHighlightsApiPageSize,
          totalCount: highlightsCount['testbook1-testpage2-uuid'] + highlightsCount['testbook1-testpage11-uuid'],
        },
      }))
    ;

    const response: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page1,
        // tslint:disable-next-line: object-literal-sort-keys
        'testbook1-testpage11-uuid': page2,
      },
    };

    const filters = summaryFilters(store.getState());
    await hook(loadMoreStudyGuides());

    expect(highlightClient).lastCalledWith(expect.objectContaining({
      page: 1,
      perPage: maxHighlightsApiPageSize,
      sourceIds: ['testbook1-testpage2-uuid', 'testbook1-testpage11-uuid'],
    }));
    expect(dispatch).lastCalledWith(receiveSummaryStudyGuides(response, {
      filters,
      pagination: {
        page: 1,
        perPage: maxHighlightsApiPageSize,
        sourceIds: ['testbook1-testpage2-uuid', 'testbook1-testpage11-uuid'],
      },
    }));

    const page3 = createTestHighlights({
      amount: highlightsCount['testbook1-testpage11-uuid'] - page2.length, // remaining highlights for testpage11
      sourceId: 'testbook1-testpage11-uuid',
      startIdsFrom: page1.length + page2.length,
    });

    const page4 = createTestHighlights({
      amount: maxHighlightsApiPageSize - page3.length,
      sourceId: 'testbook1-testpage8-uuid',
      startIdsFrom: page1.length + page2.length + page3.length,
    });

    highlightClient
      .mockReturnValueOnce(Promise.resolve({
        data: page3,
        meta: {
          page: 2,
          perPage: maxHighlightsApiPageSize,
          totalCount: highlightsCount['testbook1-testpage2-uuid'] + highlightsCount['testbook1-testpage11-uuid'],
        },
      }))
      .mockReturnValueOnce(Promise.resolve({
        data: page4,
        meta: {
          page: 1,
          perPage: maxHighlightsApiPageSize,
          totalCount: highlightsCount['testbook1-testpage8-uuid'],
        },
      }))
    ;

    await hook(store.dispatch(loadMoreStudyGuides()));

    const response2: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage11-uuid': page3,
        'testbook1-testpage8-uuid': page4,
      },
    };

    expect(loadingSpy).toHaveBeenCalled();
    expect(highlightClient).toHaveBeenCalledTimes(3);
    expect(dispatch).lastCalledWith(receiveSummaryStudyGuides(response2, {pagination: null, filters}));
  });

  it('calls loadUntilPageSize with correct parameters', async() => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }));
    store.dispatch(setSummaryFilters({
      colors: Array.from(colorfilterLabels),
      locationIds: ['testbook1-testchapter1-uuid'],
    }));

    const page1 = createTestHighlights({
      amount: 5,
      sourceId: 'testbook1-testpage2-uuid',
    });

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockReturnValueOnce(Promise.resolve({
        data: page1,
        meta: {
          page: 1,
          perPage: 20,
          totalCount: 5,
        },
      }))
    ;

    const response: SummaryHighlights = {
      'testbook1-testchapter1-uuid': {
        'testbook1-testpage2-uuid': page1,
      },
    };

    const filters = summaryFilters(store.getState());
    await hook(store.dispatch(loadMoreStudyGuides()));

    expect(loadingSpy).toHaveBeenCalledWith(expect.objectContaining({
      book,
      colors: [HighlightColorEnum.Green],
      sets: [GetHighlightsSetsEnum.Curatedopenstax],
    }));
    expect(highlightClient).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(receiveSummaryStudyGuides(response, {pagination: null, filters}));
  });

  it('throws StudyGuidesPopupLoadError', async() => {
    expect.assertions(3);
    const error = {} as any;

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(error);

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }));
    store.dispatch(setSummaryFilters({
      colors: Array.from(colorfilterLabels),
      locationIds: ['testbook1-testchapter1-uuid'],
    }));

    try {
      await hook(store.dispatch(loadMoreStudyGuides()));
    } catch (error) {
      expect(dispatch).toHaveBeenLastCalledWith(toggleStudyGuidesSummaryLoading(false));
      expect(error.messageKey).toBe(toastMessageKeys.studyGuides.failure.popUp.load);
      expect(error.meta).toEqual({ destination: 'studyGuides' });
    }
  });

  it('throws ApplicationError', async() => {
    expect.assertions(3);
    const mockCustomApplicationError = new ApplicationError('error');

    jest.spyOn(helpers.highlightClient, 'getHighlights')
      .mockRejectedValueOnce(mockCustomApplicationError);

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(page));
    store.dispatch(receiveStudyGuidesTotalCounts({
      'testbook1-testpage2-uuid': {[HighlightColorEnum.Green]: 5},
    }));
    store.dispatch(setSummaryFilters({
      colors: Array.from(colorfilterLabels),
      locationIds: ['testbook1-testchapter1-uuid'],
    }));

    try {
      await hook(store.dispatch(loadMoreStudyGuides()));
    } catch (error) {
      expect(dispatch).toHaveBeenCalledWith(toggleStudyGuidesSummaryLoading(false));
      expect(error instanceof ApplicationError).toEqual(true);
      expect(error.message).toBe(mockCustomApplicationError.message);
    }
  });

  it('noops without a page', async() => {
    store.dispatch(receiveBook(book));

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook(store.dispatch(loadMoreStudyGuides()));

    expect(highlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('noops without a book', async() => {
    store.dispatch(receivePage(page));

    const highlightClient = jest.spyOn(helpers.highlightClient, 'getHighlights');

    await hook(store.dispatch(loadMoreStudyGuides()));

    expect(highlightClient).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
