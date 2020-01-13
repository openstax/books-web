import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { formatBookData } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import { deleteHighlight, receiveSummaryHighlights, setSummaryFilters, updateHighlight } from '../actions';
import { highlightLocationFilters } from '../selectors';
import { SummaryHighlights } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import Highlights, { SectionHighlights } from './Highlights';
import HighlightToggleEdit from './HighlightToggleEdit';
import { HighlightContentWrapper, HighlightSection, LoaderWrapper } from './ShowMyHighlightsStyles';

const hlBlue = { id: 'hl1', color: HighlightColorEnum.Blue, annotation: 'hl1' };
const hlGreen = { id: 'hl2', color: HighlightColorEnum.Green, annotation: 'hl' };
const hlPink = { id: 'hl3', color: HighlightColorEnum.Pink, annotation: 'hl' };
const hlPurple = { id: 'hl4', color: HighlightColorEnum.Purple, annotation: 'hl' };
const hlYellow = { id: 'hl5', color: HighlightColorEnum.Yellow };

describe('Highlights', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let consoleError: jest.SpyInstance;
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('properly display summary highlights', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);
    const firstSectionHighlights = sections[0].findAllByType(HighlightContentWrapper);
    const secondSectionHighlights = sections[1].findAllByType(HighlightContentWrapper);
    expect(firstSectionHighlights.length).toEqual(5);
    expect(secondSectionHighlights.length).toEqual(2);

    // If locationId is same as pageId section title is not duplicated.
    expect(sections[0].findAllByType(HighlightSection).length).toEqual(0);

    const pageHighlights = summaryHighlights[pageId][pageId];
    expect(firstSectionHighlights[0].props.color).toEqual(pageHighlights[0].color);
    expect(firstSectionHighlights[1].props.color).toEqual(pageHighlights[1].color);
    expect(firstSectionHighlights[2].props.color).toEqual(pageHighlights[2].color);
    expect(firstSectionHighlights[3].props.color).toEqual(pageHighlights[3].color);
    expect(firstSectionHighlights[4].props.color).toEqual(pageHighlights[4].color);

    const pageInChapterHighlights = summaryHighlights[location!.id][pageInChapter.id];
    expect(secondSectionHighlights[0].props.color).toEqual(pageInChapterHighlights[0].color);
    expect(secondSectionHighlights[1].props.color).toEqual(pageInChapterHighlights[1].color);
  });

  it('show loading state on filters change', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
      store.dispatch(receiveSummaryHighlights(summaryHighlights));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);

    expect(component.root.findAllByType(LoaderWrapper).length).toEqual(0);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    });

    const isLoading = component.root.findByType(LoaderWrapper);
    expect(isLoading).toBeDefined();
  });

  it('show no highlights tip when locationIds filter is empty', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    expect(component.root.findByProps({ id: 'i18n:toolbar:highlights:popup:heading:no-highlights-tip' }))
      .toBeDefined();
  });

  it('show add highlight message when there is no highlights on specific page', () => {
    const pageId = stripIdVersion(page.id);

    const summaryHighlights = {} as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [pageId]}));
      store.dispatch(receiveSummaryHighlights(summaryHighlights));
    });

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    expect(component.root.findByProps({ id: 'i18n:toolbar:highlights:popup:body:add-highlight' }))
      .toBeDefined();
  });

  it('throws an error if page from summary highlights wasn\'t found in book', () => {
    store.dispatch(receivePage({...pageInChapter, references: []}));
    const pageId = stripIdVersion(pageInChapter.id);
    const locations = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locations, pageInChapter.id);

    const summaryHighlights = {
      [location!.id]: {
        'page-not-in-given-section': [hlBlue],
      },
    } as unknown as SummaryHighlights;

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [pageId]}));
      store.dispatch(receiveSummaryHighlights(summaryHighlights));
    });

    consoleError.mockReturnValueOnce(null);

    expect(() => renderer.create(<Provider store={store}>
        <MessageProvider>
          <Highlights/>
        </MessageProvider>
      </Provider>)
    ).toThrow();
  });

  it('display highlight editing menus', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    const editingMenus = component.root.findAllByType(HighlightToggleEdit);
    expect(editingMenus.length).toEqual(6);
  });

  it('edit highlight annotation', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));
    dispatch.mockClear();

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    let [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditable).toEqual(false);

    renderer.act(() => {
      const [firstEditMenu] = component.root.findAllByType(HighlightToggleEdit);
      firstEditMenu.props.onEdit();
    });

    [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditable).toEqual(true);

    renderer.act(() => {
      firstAnnotation.props.onSave('text');
    });

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {
        annotation: 'text',
        color: hlBlue.color as string as HighlightUpdateColorEnum,
      },
      id: hlBlue.id,
    }, {
      locationFilterId: pageId,
      pageId,
    }));
  });

  it('edit highlight color', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));
    dispatch.mockClear();

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const [firstEditMenu] = component.root.findAllByType(HighlightToggleEdit);
      firstEditMenu.props.onColorChange('yellow');
    });

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {
        color: 'yellow' as string as HighlightUpdateColorEnum,
      },
      id: hlBlue.id,
    }, {
      locationFilterId: pageId,
      pageId,
    }));
  });

  it('delete highlight with confirmation', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights));
    dispatch.mockClear();

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Highlights/>
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const [firstEditMenu] = component.root.findAllByType(HighlightToggleEdit);
      firstEditMenu.props.onDelete();
    });

    renderer.act(() => {
      const [firstDeleteWrapper] = component.root.findAllByType(HighlightDeleteWrapper);
      firstDeleteWrapper.props.onDelete();
    });

    expect(dispatch).toHaveBeenCalledWith(deleteHighlight(hlBlue.id, {
      locationFilterId: pageId,
      pageId,
    }));
  });
});
