import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import * as Cookies from 'js-cookie';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { receiveLoggedOut, receiveUser } from '../../../auth/actions';
import Checkbox from '../../../components/Checkbox';
import { DropdownToggle } from '../../../components/Dropdown';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { receiveBook } from '../../actions';
import FiltersList, { FiltersListColor } from '../../components/popUp/FiltersList';
import { formatBookData, stripIdVersion } from '../../utils';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import {
  printStudyGuides,
  receiveStudyGuidesTotalCounts,
  receiveSummaryStudyGuides,
  updateSummaryFilters,
} from '../actions';
import Filters from './Filters';
import { cookieUTG } from './UsingThisGuide/constants';
import UsingThisGuideBanner from './UsingThisGuide/UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuide/UsingThisGuideButton';

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;
  const window = assertWindow();
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();

    window.print = jest.fn();

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot with UTG banner open (opened initially)', () => {
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    renderer.act(() => {
      const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
      colorFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correct label keys for color dropdown', () => {
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const labelBlueKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:blue' });
    const labelGreenKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:green' });
    const labelPurpleKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:purple' });
    const labelYellowKey = component.root.findByProps({ id: 'i18n:studyguides:popup:filters:yellow' });

    expect(labelBlueKey).toBeTruthy();
    expect(labelGreenKey).toBeTruthy();
    expect(labelPurpleKey).toBeTruthy();
    expect(labelYellowKey).toBeTruthy();
  });

  it('does renders ConnectedFilterList if user is logged in', () => {
    store.dispatch(receiveUser({} as any));
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    expect(() => component.root.findByType(FiltersList)).not.toThrow();
  });

  it('does not render ConnectedFilterList if user is logged out', () => {
    store.dispatch(receiveLoggedOut());
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    expect(() => component.root.findByType(FiltersList)).toThrow();
  });

  it('dispatches updateSummaryFilters action on selecting colors and chapters', () => {
    const chapter = findArchiveTreeNodeById(book.tree, 'testbook1-testchapter1-uuid')!;
    store.dispatch(receiveBook(book));
    store.dispatch(receiveStudyGuidesTotalCounts({
      [chapter.id]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);

    renderer.act(() => {
      colorFilterToggle.props.onClick();
    });

    const [yellowCheckbox] = component.root.findAllByType(Checkbox);

    renderer.act(() => {
      yellowCheckbox.props.onChange();
    });

    expect(dispatch).toHaveBeenCalledWith(updateSummaryFilters({
      colors: { new: [], remove: [HighlightColorEnum.Yellow] },
    }));

    renderer.act(() => {
      yellowCheckbox.props.onChange();
      colorFilterToggle.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(updateSummaryFilters({
      colors: { new: [HighlightColorEnum.Yellow], remove: [] },
    }));

    dispatch.mockClear();

    renderer.act(() => {
      chapterFilterToggle.props.onClick();
    });

    const [ch1] = component.root.findAllByType(Checkbox);

    renderer.act(() => {
      ch1.props.onChange();
    });

    expect(dispatch).toHaveBeenCalledWith(updateSummaryFilters({
      locations: { new: [chapter], remove: [] },
    }));
  });

  it('dispatches updateSummaryFilters when removing selected colors from FiltersList', () => {
    store.dispatch(receiveUser({} as any));
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<TestContainer services={services} store={store}>
      <Filters />
    </TestContainer>);

    const filtersList = component.root.findByType(FiltersList);

    const [green] = filtersList.findAllByType(FiltersListColor);

    renderer.act(() => {
      green.props.onRemove();
    });

    expect(dispatch).toHaveBeenCalledWith(updateSummaryFilters({
      colors: { new: [], remove: [HighlightColorEnum.Green] },
    }));
  });

  describe('PrintButton', () => {
    it('triggers print immediately if nothing left to load', () => {
      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).not.toHaveBeenCalledWith(printStudyGuides());
      expect(window.print).toHaveBeenCalled();
    });

    it('loads remaining highlights before printing', () => {
      store.dispatch(receiveSummaryStudyGuides({}, {pagination: {} as any}));

      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(dispatch).toHaveBeenCalledWith(printStudyGuides());
    });
  });

  describe('Using This Guide Button', () => {
    it('renders button and banner when button is clicked and closes correctly', () => {
      // If cookie is set then banner will be closed initially
      Cookies.set(cookieUTG, 'true');

      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const uTGbutton = component.root.findByType(UsingThisGuideButton);

      renderer.act(() => {
        uTGbutton.props.onClick();
      });

      expect(component.root.findByType(UsingThisGuideBanner).props.show).toBe(true);

      const uTGcloseButton = component.root.findByProps({ 'data-testid': 'close-utg' });

      renderer.act(() => {
        uTGcloseButton.props.onClick();
      });

      expect(component.root.findByType(UsingThisGuideBanner).props.show).toBe(false);
    });

    it('does not send ga event if it was opened initialy but set cookie', () => {
      // If cookie is not set then banner will be opened initially
      Cookies.remove(cookieUTG);

      const spyTrack = jest.spyOn(services.analytics.openUTG, 'track');

      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      // wait for hooks
      // tslint:disable-next-line: no-empty
      renderer.act(() => {});

      const banner = component.root.findByType(UsingThisGuideBanner);
      expect(banner.props.show).toEqual(true);
      expect(Cookies.get(cookieUTG)).toBe('true');
      expect(spyTrack).not.toHaveBeenCalled();
    });

    it('send ga event when opened', () => {
      const spyTrack = jest.spyOn(services.analytics.openUTG, 'track');
      // If cookie is set then banner will be closed initially
      Cookies.set(cookieUTG, 'true');

      const component = renderer.create(<TestContainer services={services} store={store}>
        <Filters />
      </TestContainer>);

      const banner = component.root.findByType(UsingThisGuideBanner);
      expect(banner.props.show).toEqual(false);
      expect(Cookies.get(cookieUTG)).toEqual('true');
      expect(spyTrack).not.toHaveBeenCalled();

      const toggleButton = component.root.findByType(UsingThisGuideButton);

      // open banner
      renderer.act(() => {
        toggleButton.props.onClick();
      });

      expect(banner.props.show).toEqual(true);
      expect(spyTrack).toHaveBeenCalledTimes(1);

      // close banner
      renderer.act(() => {
        toggleButton.props.onClick();
      });

      expect(banner.props.show).toEqual(false);
      expect(spyTrack).toHaveBeenCalledTimes(1); // do not send ga event on close

      // open banner again
      renderer.act(() => {
        toggleButton.props.onClick();
      });

      expect(banner.props.show).toEqual(true);
      expect(spyTrack).toHaveBeenCalledTimes(2); // send ga event every time when opening
    });
  });
});
