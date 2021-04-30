import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { receiveLoggedOut } from '../../../auth/actions';
import AllOrNone from '../../../components/AllOrNone';
import { ButtonLink } from '../../../components/Button';
import Checkbox from '../../../components/Checkbox';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { receiveHighlightsTotalCounts } from '../../highlights/actions';
import { ConnectedChapterFilter } from '../../highlights/components/SummaryPopup/Filters';
import { receiveStudyGuidesTotalCounts } from '../../studyGuides/actions';
import Filters from '../../studyGuides/components/Filters';
import { formatBookData, stripIdVersion } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import ChapterFilter, { StyledDetails, StyledSummary } from './ChapterFilter';
import { LocationFilters } from './types';

describe('ChapterFilter', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  const locationIds = new Map() as LocationFilters;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();

    store.dispatch(receivePage({...page, references: []}));
  });

  it('matches snapshot', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    }, new Map([[
      'testbook1-testpage1-uuid',
      { section: assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid'), '') },
    ]])));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without a book', () => {
    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const checkedBoxes = component.root.findAllByProps({checked: true});
    expect(checkedBoxes.length).toBe(0);
  });

  it('initially has selected chapters with highlights', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter3-uuid': {[HighlightColorEnum.Green]: 3},
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Pink]: 1},
    }, new Map([
      [
        'testbook1-testpage1-uuid',
        { section: assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid'), '') },
      ],
      [
        'testbook1-testchapter3-uuid',
        { section: assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testchapter3-uuid'), '') },
      ],
    ])));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const [box1, box2, box3, box4, box5] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);
    expect(box3.props.checked).toBe(false);
    expect(box4.props.checked).toBe(false);
    expect(box5.props.checked).toBe(true);
  });

  it('checks and unchecks chapters', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    }, new Map([[
      'testbook1-testpage1-uuid',
      { section: assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid'), '') },
    ]])));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const [box1] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(box1.props.checked).toBe(false);

    renderer.act(() => {
      box1.props.onChange();
    });

    expect(box1.props.checked).toBe(true);
  });

  it('selects none', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    }, new Map([[
      'testbook1-testpage1-uuid',
      { section: assertDefined(findArchiveTreeNodeById(book.tree, 'testbook1-testpage1-uuid'), '') },
    ]])));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const [box1, box2] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
  });

  it('selects all select only chapters with highlights', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter3-uuid': {[HighlightColorEnum.Green]: 3},
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    }, locationIds));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const [box1, box2, , , box5] = component.root.findAllByType(Checkbox);
    const allOrNone = component.root.findByType(AllOrNone);

    renderer.act(() => {
      allOrNone.props.onNone();
    });

    expect(box1.props.checked).toBe(false);
    expect(box2.props.checked).toBe(false);
    expect(box5.props.checked).toBe(false);

    renderer.act(() => {
      allOrNone.props.onAll();
    });

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);
    expect(box5.props.checked).toBe(true);
  });

  it('chapters without highlights are disabled', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': {[HighlightColorEnum.Green]: 1},
    }, locationIds));

    const component = renderer.create(<TestContainer store={store}>
      <ConnectedChapterFilter multiselect={true} />
    </TestContainer>);

    const [box1, ...otherBoxes] = component.root.findAllByType(Checkbox);

    expect(box1.props.disabled).toBe(false);
    expect(otherBoxes.every((box) => box.props.disabled)).toBe(true);
  });

  it('disables all or none when logged out user', () => {
    store.dispatch(receiveLoggedOut());
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer store={store}>
        <Filters />
      </TestContainer>);

    const [...allOrNoneButtons] = component.root.findAllByType(ButtonLink);
    expect(allOrNoneButtons.every((button) => button.props.disabled)).toBe(true);
  });

  it('toggle <details> on click', () => {
    const locationFilters = new Map([[
      'testbook1-testchapter2-uuid',
      {
        children: [{ id: 'testbook1-testpage3-uuid', title: 'page' }],
        section: { id: 'testbook1-testchapter2-uuid', title: 'chapter' },
      },
    ]]);

    const component = renderer.create(<TestContainer store={store}>
      <ChapterFilter
        locationFilters={locationFilters}
        locationFiltersWithContent={new Set()}
        selectedLocationFilters={new Set()}
        ariaLabelItemId='i18n:practice-questions:popup:filters:filter-by:aria-label'
      />
    </TestContainer>);

    const [details] = component.root.findAllByType(StyledDetails);
    const [summary] = details.findAllByType(StyledSummary);
    expect(details.props.open).toEqual(false);

    renderer.act(() => {
      summary.props.onClick({ preventDefault: jest.fn() });
    });

    component.update(<TestContainer store={store}>
      <ChapterFilter
        locationFilters={locationFilters}
        locationFiltersWithContent={new Set()}
        selectedLocationFilters={new Set()}
        ariaLabelItemId='i18n:practice-questions:popup:filters:filter-by:aria-label'
      />
    </TestContainer>);

    expect(details.props.open).toEqual(true);
  });
});
