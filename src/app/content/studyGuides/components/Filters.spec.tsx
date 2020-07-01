import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { DropdownToggle } from '../../../components/Dropdown';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { formatBookData, stripIdVersion } from '../../utils';
import { printStudyGuides, receiveStudyGuidesTotalCounts, receiveSummaryStudyGuides } from '../actions';
import Filters from './Filters';

jest.mock('../../components/popUp/ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let printSpy: jest.SpyInstance;
  let dispatch: jest.SpyInstance;
  const window = assertWindow();
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();

    window.print = jest.fn();

    dispatch = jest.spyOn(store, 'dispatch');
    printSpy = jest.spyOn(services.analytics.printStudyGuides, 'track');
  });

  it('matches snapshot', () => {
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

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Filters />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('PrintButton', () => {
    it('triggers analytics event on click', () => {
      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Filters />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(printSpy).toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalledWith(printStudyGuides());
      expect(window.print).toHaveBeenCalled();
    });

    it('loads remaining highlights before printing', () => {
      store.dispatch(receiveSummaryStudyGuides({}, {pagination: {} as any}));

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <Filters />
          </MessageProvider>
        </Services.Provider>
      </Provider>);

      const printButton = component.root.findByProps({'data-testid': 'print'});

      renderer.act(() => {
        printButton.props.onClick();
      });

      expect(printSpy).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(printStudyGuides());
    });
  });
});
