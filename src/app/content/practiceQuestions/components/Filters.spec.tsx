import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../test/TestContainer';
import { DropdownToggle } from '../../../components/Dropdown';
import { Store } from '../../../types';
import { receiveBook } from '../../actions';
import { StyledDetails, StyledSectionItem, StyledSummary } from '../../components/popUp/ChapterFilter';
import { LocationFiltersWithChildren } from '../../components/popUp/types';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import * as selectors from '../selectors';
import Filters from './Filters';

describe('Filters', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let render: () => JSX.Element;
  const mockLocationFilters = new Map([
    ['testbook1-testchapter1-uuid', {
      children: [
        { id: 'testbook1-testpage11-uuid', title: 'section1' },
        { id: 'testbook1-testpage8-uuid', title: 'section2' },
      ],
      section: { id: 'testbook1-testchapter1-uuid', title: 'chapterId' },
    }],
    ['testbook1-testchapter2-uuid', {
      children: [{ id: 'testbook1-testpage3-uuid', title: 'section21' }],
      section: { id: 'testbook1-testchapter2-uuid', title: 'chapterId2' },
    }],
  ]) as LocationFiltersWithChildren;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    render = () => <TestContainer store={store}>
      <Filters />
    </TestContainer>;
  });

  it('ChapterFilter matches snapshot when it is closed', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({ id: 'section21', parent: { id: 'chapterId2' } } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
    mockSection.mockReset();
  });

  it('ChapterFilter matches snapshot when open without selected section', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
  });

  it('ChapterFilter matches snapshot when open with selected section', () => {
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({
        id: 'testbook1-testpage3-uuid',
        parent: { id: 'testbook1-testchapter2-uuid' },
      } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    expect(component).toMatchSnapshot();

    mockFilters.mockReset();
    mockSection.mockReset();
  });

  it('ChapterFilter with chapters and sections works properly', () => {
    store.dispatch(receiveBook(book));
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(mockLocationFilters);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({
        id: 'testbook1-testpage3-uuid',
        parent: { id: 'testbook1-testchapter2-uuid' },
      } as LinkedArchiveTreeSection);

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const [details1, details2] = component.root.findAllByType(StyledDetails);
    expect(details1.props.open).toEqual(false);
    expect(details2.props.open).toEqual(true);

    const mockPreventDefault = jest.fn();

    renderer.act(() => {
      const summary = details2.findByType(StyledSummary);
      summary.props.onClick({ preventDefault: mockPreventDefault });
    });

    expect(details1.props.open).toEqual(false);
    expect(details2.props.open).toEqual(false);

    renderer.act(() => {
      const summary = details1.findByType(StyledSummary);
      summary.props.onClick({ preventDefault: mockPreventDefault });
    });

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(details1.props.open).toEqual(true);
    expect(details2.props.open).toEqual(false);

    renderer.act(() => {
      const [section1] = details1.findAllByType(StyledSectionItem);
      section1.props.onClick();
    });

    const expectedSection = { id: 'testbook1-testpage11-uuid', title: 'section1' };

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(expectedSection as any));

    mockFilters.mockReset();
    mockSection.mockReset();
  });

  it('ChapterFilter does not dispatch setSelectedSection if clicked on already selected section', () => {
    store.dispatch(receiveBook(book));
    const mockFilters = jest.spyOn(selectors, 'practiceQuestionsLocationFilters')
      .mockReturnValue(new Map([
        ['doesnt-matter', {
          children: [
            { id: 'this will not be found in the book', title: 'section1' },
          ],
          section: { id: 'doesnt-matter', title: 'chapterId' },
        }],
      ]) as LocationFiltersWithChildren);
    const mockSection = jest.spyOn(selectors, 'selectedSection')
      .mockReturnValue({
        id: 'this will not be found in the book',
        parent: { id: 'doesnt-matter' },
      } as LinkedArchiveTreeSection);

    dispatch.mockClear();

    const component = renderer.create(render());

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const [details1] = component.root.findAllByType(StyledDetails);

    renderer.act(() => {
      const summary = details1.findByType(StyledSummary);
      summary.props.onClick({ preventDefault: jest.fn() });
    });

    renderer.act(() => {
      const [section1] = details1.findAllByType(StyledSectionItem);
      section1.props.onClick();
    });

    expect(dispatch).not.toHaveBeenCalled();

    mockFilters.mockReset();
    mockSection.mockReset();
  });
});
