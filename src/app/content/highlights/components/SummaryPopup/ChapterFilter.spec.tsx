import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import MessageProvider from '../../../../MessageProvider';
import { MiddlewareAPI, Store } from '../../../../types';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import { receiveHighlightsTotalCounts } from '../../actions';
import { hookBody } from '../../hooks/receiveHighlightsTotalCounts';
import ChapterFilter from './ChapterFilter';

describe('ChapterFilter', () => {
  const book = formatBookData(archiveBook, mockCmsBook);
  let store: Store;
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let hook: ReturnType<typeof hookBody>;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    hook = (hookBody)(helpers);

    store.dispatch(receivePage({...page, references: []}));
  });

  it('matches snapshot', () => {
    store.dispatch(receiveBook(book));
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without a book', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const checkedBoxes = component.root.findAllByProps({checked: true});
    expect(checkedBoxes.length).toBe(0);
  });

  it('initially has selected chapters with highlights', () => {
    store.dispatch(receiveBook(book));
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter3-uuid': 3,
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, box2, box3, box4, box5] = component.root.findAllByType(Checkbox);

    expect(box1.props.checked).toBe(true);
    expect(box2.props.checked).toBe(false);
    expect(box3.props.checked).toBe(false);
    expect(box4.props.checked).toBe(false);
    expect(box5.props.checked).toBe(true);
  });

  it('checks and unchecks chapters', () => {
    store.dispatch(receiveBook(book));
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

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
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

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
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testchapter3-uuid': 3,
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

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
    hook(store.dispatch(receiveHighlightsTotalCounts({
      'testbook1-testpage1-uuid': 1,
    })));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ChapterFilter />
      </MessageProvider>
    </Provider>);

    const [box1, ...otherBoxes] = component.root.findAllByType(Checkbox);

    expect(box1.props.disabled).toBe(false);
    expect(otherBoxes.every((box) => box.props.disabled)).toBe(true);
  });
});
