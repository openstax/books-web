import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, pageInChapter } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { DropdownToggle } from '../../../components/Dropdown';
import { MiddlewareAPI, Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { receiveHighlightsTotalCounts, setSummaryFilters, updateSummaryFilters } from '../../highlights/actions';
import Filters from '../../highlights/components/SummaryPopup/Filters';
import { ArchiveTree } from '../../types';
import { formatBookData } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { FiltersListChapter, FiltersListColor, StyledPlainButton } from './FiltersList';

jest.mock('./ColorFilter', () => (props: any) => <div mock-color-filter {...props} />);
jest.mock('./ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let storeDispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
    storeDispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }, new Map()));
    const component = renderer.create(<TestContainer store={store}>
      <Filters />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when open color filters', () => {
    const component = renderer.create(<TestContainer store={store}>
      <Filters/>
    </TestContainer>);

    renderer.act(() => {
      const [, colorFiltersToggle] = component.root.findAllByType(DropdownToggle);
      colorFiltersToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('updates on summary filters change', () => {
    const pageId = stripIdVersion(book.tree.contents[0].id);
    const chapterId = stripIdVersion(book.tree.contents[1].id);
    const chapterPageId = stripIdVersion((book.tree.contents[1] as ArchiveTree).contents[1].id);

    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
      [chapterPageId]: {
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }, new Map([
      [pageId, { section: assertDefined(findArchiveTreeNodeById(book.tree, pageId), '') }],
      [chapterId, { section: assertDefined(findArchiveTreeNodeById(book.tree, chapterId), '') }],
    ])));
    store.dispatch(setSummaryFilters({
      locationIds: [],
    }));

    const component = renderer.create(<TestContainer store={store}>
      <Filters />
    </TestContainer>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(5);

    renderer.act(() => {
      store.dispatch(setSummaryFilters({
        colors: [HighlightColorEnum.Blue, HighlightColorEnum.Yellow],
        locationIds: [pageId, chapterId],
      }));
    });

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(2);
    expect(chapterFilters[0].props.locationId).toEqual(pageId);
    expect(chapterFilters[1].props.locationId).toEqual(chapterId);
    expect(colorFilters.length).toEqual(2);
    expect(colorFilters[0].props.color).toEqual(HighlightColorEnum.Blue);
    expect(colorFilters[1].props.color).toEqual(HighlightColorEnum.Yellow);
  });

  it('removes colors and chapters from filters on click', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...pageInChapter, references: []}));
    const mockChapterFilter = assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testchapter5-uuid'), '');
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter5-uuid': {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Blue]: 1,
      },
    }, new Map([[
      'testbook1-testchapter5-uuid',
      { section: mockChapterFilter },
    ]])));

    dispatch.mockClear();
    storeDispatch.mockClear();

    const component = renderer.create(<TestContainer store={store}>
      <Filters />
    </TestContainer>);

    let chapterFilters = component.root.findAllByType(FiltersListChapter);
    let colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(1);
    expect(colorFilters.length).toEqual(2);

    renderer.act(() => {
      chapterFilters[0].findByType(StyledPlainButton).props.onClick();
    });

    expect(storeDispatch).toBeCalledWith(updateSummaryFilters({
      locations: {
        new: [],
        remove: [mockChapterFilter],
      },
    }));

    renderer.act(() => {
      colorFilters[0].findByType(StyledPlainButton).props.onClick();
    });

    expect(storeDispatch).toBeCalledWith(updateSummaryFilters({
      colors: {
        new: [],
        remove: [HighlightColorEnum.Blue],
      },
    }));

    chapterFilters = component.root.findAllByType(FiltersListChapter);
    colorFilters = component.root.findAllByType(FiltersListColor);

    expect(chapterFilters.length).toEqual(0);
    expect(colorFilters.length).toEqual(1);
  });
});
