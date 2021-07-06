import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import MessageProvider from '../../../../../test/MessageProvider';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import Checkbox from '../../../../components/Checkbox';
import { DropdownToggle } from '../../../../components/Dropdown';
import * as Services from '../../../../context/Services';
import { Store } from '../../../../types';
import { formatBookData, stripIdVersion } from '../../../utils';
import { receiveHighlightsTotalCounts, updateSummaryFilters } from '../../actions';
import Filters from './Filters';

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
    services = createTestServices();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot and renders proper aria labels', () => {
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const [chapterFilterToggle, colorFilterToggle] = component.root.findAllByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
      colorFilterToggle.props.onClick();
    });

    const labelBlueKey = component.root.findAllByProps({ id: 'i18n:highlighting:colors:blue' });
    const labelGreenKey = component.root.findAllByProps({ id: 'i18n:highlighting:colors:green' });
    const labelPurpleKey = component.root.findAllByProps({ id: 'i18n:highlighting:colors:purple' });
    const labelYellowKey = component.root.findAllByProps({ id: 'i18n:highlighting:colors:yellow' });
    const labelPinkKey = component.root.findAllByProps({ id: 'i18n:highlighting:colors:pink' });

    // There should be 2 elements with each of these ids. One is ColorLabel and second is FiltersListColor
    expect(labelBlueKey.length).toEqual(2);
    expect(labelGreenKey.length).toEqual(2);
    expect(labelPurpleKey.length).toEqual(2);
    expect(labelYellowKey.length).toEqual(2);
    expect(labelPinkKey.length).toEqual(2);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('dispatches updateSummaryFilters action', () => {
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const [, colorFilterToggle] = component.root.findAllByType(DropdownToggle);
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
    });

    expect(dispatch).toHaveBeenCalledWith(updateSummaryFilters({
      colors: { new: [HighlightColorEnum.Yellow], remove: [] },
    }));
  });
});
