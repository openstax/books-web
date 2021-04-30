import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import { typesetMath } from '../../../../helpers/mathjax';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, pageInChapter, pageInOtherChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import SectionHighlights from '../../components/SectionHighlights';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { SummaryHighlights } from '../../highlights/types';
import { getHighlightLocationFilterForPage } from '../../highlights/utils';
import LoaderWrapper from '../../styles/LoaderWrapper';
import { formatBookData } from '../../utils';
import { receiveStudyGuidesTotalCounts, receiveSummaryStudyGuides, setSummaryFilters } from '../actions';
import { studyGuidesLocationFilters } from '../selectors';
import StudyGuides, { NoStudyGuidesTip } from './StudyGuides';

const hlBlue = {
  annotation: 'hl1', color: HighlightColorEnum.Blue,
  highlightedContent: 'content', id: 'hl1', sourceId: 'testbook1-testpage1-uuid',
};
const hlGreen = {
  annotation: 'hl', color: HighlightColorEnum.Green,
  highlightedContent: 'content', id: 'hl2',  sourceId: 'testbook1-testpage1-uuid',
};
const hlPink = {
  annotation: 'hl', color: HighlightColorEnum.Pink,
  highlightedContent: 'content', id: 'hl3', sourceId: 'testbook1-testpage1-uuid',
};
const hlPurple = {
  annotation: 'hl', color: HighlightColorEnum.Purple,
  highlightedContent: 'content', id: 'hl4', sourceId: 'testbook1-testpage1-uuid',
};
const hlYellow = {
  color: HighlightColorEnum.Yellow,
  highlightedContent: 'content', id: 'hl5', sourceId: 'testbook1-testpage1-uuid',
};

describe('StudyGuides', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));

    services = createTestServices();
  });

  it('properly display summary highlights', () => {
    const state = store.getState();
    const locationFilters = studyGuidesLocationFilters(state);
    const firstLocation = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    const secondLocation = getHighlightLocationFilterForPage(locationFilters, pageInOtherChapter);

    if (!firstLocation || !secondLocation) {
      return expect([firstLocation, secondLocation]).not.toContain(undefined);
    }

    const summaryHighlights = {
      [firstLocation.id]: {
        [pageInChapter.id]: [
          {...hlBlue, highlightedContent: '<a href="link">Link</a>'},
          hlGreen,
          hlPink,
          hlPurple,
          {...hlYellow, color: null} /* for coverage for css when color was not found */,
        ],
      },
      [secondLocation.id]: {
        [pageInOtherChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryStudyGuides(summaryHighlights, {pagination: null}));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyGuides />
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('add promises to promise collector at render', () => {
    const container = assertWindow().document.createElement('div');
    const spyPromiseCollectorAdd = jest.spyOn(services.promiseCollector, 'add');

    const locationFilters = studyGuidesLocationFilters(store.getState());
    const firstLocation = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    const secondLocation = getHighlightLocationFilterForPage(locationFilters, pageInOtherChapter);

    if (!firstLocation || !secondLocation) {
      return expect([firstLocation, secondLocation]).not.toContain(undefined);
    }

    const summaryHighlights = {
      [firstLocation.id]: {
        [pageInChapter.id]: [
          hlBlue,
          hlGreen,
          hlPink,
          hlPurple,
          {...hlYellow, color: null} /* for coverage for css when color was not found */,
        ],
      },
      [secondLocation.id]: {
        [pageInOtherChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryStudyGuides(summaryHighlights, {pagination: null}));

    renderer.create(<TestContainer services={services} store={store}>
      <StudyGuides />
    </TestContainer>, { createNodeMock: () => container });

    expect(spyPromiseCollectorAdd).toHaveBeenCalledWith(allImagesLoaded(container));
    expect(spyPromiseCollectorAdd).toHaveBeenCalledWith(typesetMath(container, assertWindow()));
  });

  it('show loading state on filters change', () => {
    const state = store.getState();
    const locationFilters = studyGuidesLocationFilters(state);
    const firstLocation = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    const secondLocation = getHighlightLocationFilterForPage(locationFilters, pageInOtherChapter);

    if (!firstLocation || !secondLocation) {
      return expect([firstLocation, secondLocation]).not.toContain(undefined);
    }

    store.dispatch(receiveStudyGuidesTotalCounts({
      [firstLocation.id]: {[HighlightColorEnum.Green]: 5},
      [secondLocation.id]: {[HighlightColorEnum.Green]: 2},
    }));

    const summaryHighlights = {
      [firstLocation.id]: {
        [pageInOtherChapter.id]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [secondLocation.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [firstLocation.id, secondLocation.id]}));
      store.dispatch(receiveSummaryStudyGuides(summaryHighlights, {pagination: null}));
    });

    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyGuides/>
    </TestContainer>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);

    expect(component.root.findAllByType(LoaderWrapper).length).toEqual(0);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [firstLocation.id, secondLocation.id]}));
    });

    const isLoading = component.root.findByType(LoaderWrapper);
    expect(isLoading).toBeDefined();
  });

  it('shows "no results" state', () => {
    const summaryStudyGuides = {} as SummaryHighlights;
    store.dispatch(receiveSummaryStudyGuides(summaryStudyGuides, {pagination: null}));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyGuides />
    </TestContainer>);

    expect(component.root.findByProps(NoStudyGuidesTip)).toBeDefined();
  });
});
