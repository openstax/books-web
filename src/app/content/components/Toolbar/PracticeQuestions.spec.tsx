import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { book as archiveBook, page as shortPage } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import * as Services from '../../../context/Services';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { Store } from '../../../types';
import { receiveBook, receivePage } from '../../actions';
import { practiceQuestionsFeatureFlag } from '../../constants';
import * as selectors from '../../practiceQuestions/selectors';
import { formatBookData } from '../../utils';
import PracticeQuestionsButton, { StyledContentLink } from './PracticeQuestionsButton';

jest.mock('../../../../config.books', () => {
  const mockBook = (jest as any).requireActual('../../../../test/mocks/archiveLoader').book;
  return { [mockBook.id]: { defaultVersion: mockBook.version } };
});

const book = formatBookData(archiveBook, mockCmsBook);

describe('practice questions button', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>;
  });

  it('does not render if feature flag is not enabled and there are no practice questions', () => {
    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders if feature flag is enabled and there are practice questions', () => {
    jest.spyOn(selectors, 'hasPracticeQuestions').mockReturnValue(true);
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveBook(book));

    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('clicking button activates openClosePracticeQuestions analytics', () => {
    const spyTrack = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');
    jest.spyOn(selectors, 'hasPracticeQuestions').mockReturnValue(true);

    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveBook(book));

    const component = renderer.create(render());

    renderer.act(() => {
      const button = component.root.findByType(StyledContentLink);
      button.props.onClick();
    });

    expect(spyTrack).toHaveBeenCalled();
  });
});
