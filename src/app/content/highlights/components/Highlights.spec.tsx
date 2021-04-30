import { Highlight, HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import SectionHighlights, { HighlightSection } from '../../components/SectionHighlights';
import LoaderWrapper from '../../styles/LoaderWrapper';
import { formatBookData } from '../../utils';
import { stripIdVersion } from '../../utils/idUtils';
import {
  receiveHighlightsTotalCounts,
  receiveSummaryHighlights,
  requestDeleteHighlight,
  setSummaryFilters,
  updateHighlight,
} from '../actions';
import * as requestDeleteHighlightHook from '../hooks/requestDeleteHighlight';
import { highlightLocationFilters } from '../selectors';
import { SummaryHighlights } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import Highlights from './Highlights';
import { NoHighlightsTip } from './Highlights';
import ContextMenu from './SummaryPopup/ContextMenu';
import HighlightAnnotation from './SummaryPopup/HighlightAnnotation';
import HighlightDeleteWrapper from './SummaryPopup/HighlightDeleteWrapper';
import { HighlightContentWrapper } from './SummaryPopup/HighlightListElement';

const hlBlue = { id: 'hl1', color: HighlightColorEnum.Blue, annotation: 'hl1', sourceId: 'testbook1-testpage1-uuid' };
const hlGreen = { id: 'hl2', color: HighlightColorEnum.Green, annotation: 'hl', sourceId: 'testbook1-testpage1-uuid' };
const hlPink = { id: 'hl3', color: HighlightColorEnum.Pink, annotation: 'hl', sourceId: 'testbook1-testpage1-uuid' };
const hlPurple = { annotation: 'hl', color: HighlightColorEnum.Purple,
  id: 'hl4', sourceId: 'testbook1-testpage1-uuid' };
const hlYellow = { id: 'hl5', color: HighlightColorEnum.Yellow, sourceId: 'testbook1-testpage1-uuid' };

describe('Highlights', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let consoleError: jest.SpyInstance;
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error');
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');

    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));

    services = createTestServices();
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
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, new Map()));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple, hlYellow],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

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

    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, new Map()));

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
      store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));
    });

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    const sections = component.root.findAllByType(SectionHighlights);
    expect(sections.length).toEqual(2);

    expect(component.root.findAllByType(LoaderWrapper).length).toEqual(0);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    });

    const isLoading = component.root.findByType(LoaderWrapper);
    expect(isLoading).toBeDefined();
  });

  it('show no highlights tip when there are no highlights for selected filters', () => {
    store.dispatch(receiveHighlightsTotalCounts({
      pageId: {[HighlightColorEnum.Green]: 5},
      pageId2: {[HighlightColorEnum.Green]: 2},
    }, new Map()));
    store.dispatch(setSummaryFilters({locationIds: ['not-in-book']}));
    store.dispatch(receiveSummaryHighlights({}, {pagination: null}));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    // i'm not sure why this type is wrong
    expect(component.root.findByType(NoHighlightsTip as any))
      .toBeDefined();
  });

  it('show add highlight message when there are no highlights in specific book', () => {
    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    expect(component.root.findByProps({ id: 'i18n:toolbar:highlights:popup:body:add-highlight' }))
      .toBeDefined();
  });

  it('display highlight editing menus', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, locationFilters));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    const editingMenus = component.root.findAllByType(ContextMenu);
    expect(editingMenus.length).toEqual(6);
  });

  it('edit and cancel editing highlight annotation', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, locationFilters));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));
    dispatch.mockClear();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    let [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditing).toEqual(false);

    renderer.act(() => {
      const [firstContextMenu] = component.root.findAllByType(ContextMenu);
      firstContextMenu.props.onEdit();
    });

    [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditing).toEqual(true);

    renderer.act(() => {
      firstAnnotation.props.onSave('text');
    });

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {
        annotation: 'text',
      },
      id: hlBlue.id,
    }, {
      locationFilterId: pageId,
      pageId,
      preUpdateData: {
        highlight: {annotation: hlBlue.annotation, color: hlBlue.color as string as HighlightUpdateColorEnum},
        id: hlBlue.id,
      },
    }));

    renderer.act(() => {
      const [firstContextMenu] = component.root.findAllByType(ContextMenu);
      firstContextMenu.props.onEdit();
    });

    [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditing).toEqual(true);

    renderer.act(() => {
      firstAnnotation.props.onCancel();
    });

    [firstAnnotation] = component.root.findAllByType(HighlightAnnotation);
    expect(firstAnnotation.props.isEditing).toEqual(false);
  });

  it('edit highlight color', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, locationFilters));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));
    dispatch.mockClear();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    renderer.act(() => {
      const [firstContextMenu] = component.root.findAllByType(ContextMenu);
      firstContextMenu.props.onColorChange('yellow');
    });

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {
        color: 'yellow' as string as HighlightUpdateColorEnum,
      },
      id: hlBlue.id,
    }, {
      locationFilterId: pageId,
      pageId,
      preUpdateData: {
        highlight: {annotation: hlBlue.annotation, color: hlBlue.color as string as HighlightUpdateColorEnum},
        id: hlBlue.id,
      },
    }));
  });

  it('delete and cancel deleting highlight with confirmation', () => {
    const state = store.getState();
    const pageId = stripIdVersion(page.id);
    const locationFilters = highlightLocationFilters(state);
    const location = getHighlightLocationFilterForPage(locationFilters, pageInChapter);
    expect(location).toBeDefined();

    store.dispatch(setSummaryFilters({locationIds: [location!.id, pageId]}));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {[HighlightColorEnum.Green]: 5},
      [location!.id]: {[HighlightColorEnum.Green]: 2},
    }, locationFilters));

    const summaryHighlights = {
      [pageId]: {
        [pageId]: [hlBlue, hlGreen, hlPink, hlPurple],
      },
      [location!.id]: {
        [pageInChapter.id]: [hlBlue, hlGreen],
      },
    } as SummaryHighlights;

    store.dispatch(receiveSummaryHighlights(summaryHighlights, {pagination: null}));
    dispatch.mockClear();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Highlights/>
    </TestContainer>);

    renderer.act(() => {
      const [firstContextMenu, secondContextMenu] = component.root.findAllByType(ContextMenu);
      firstContextMenu.props.onDelete();
      secondContextMenu.props.onDelete();
    });

    expect(component.root.findAllByType(HighlightDeleteWrapper).length).toEqual(2);

    renderer.act(() => {
      const [firstDeleteWrapper, secondDeleteWrapper] = component.root.findAllByType(HighlightDeleteWrapper);
      firstDeleteWrapper.props.onDelete();
      secondDeleteWrapper.props.onCancel();

      requestDeleteHighlightHook.hookBody({...services, getState: store.getState, dispatch: store.dispatch})(
        requestDeleteHighlight(hlBlue as Highlight, {
          locationFilterId: pageId,
          pageId,
        }
      ));
    });

    expect(dispatch).toHaveBeenCalledWith(requestDeleteHighlight(hlBlue as Highlight, {
      locationFilterId: pageId,
      pageId,
    }));

    expect(component.root.findAllByType(HighlightDeleteWrapper).length).toEqual(0);
  });
});
