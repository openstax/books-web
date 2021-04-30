import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { book as archiveBook, lastPage, page as firstPage, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import TestContainer from '../../../test/TestContainer';
import { AppState, Store } from '../../types';
import { receiveBook, receivePage } from '../actions';
import { initialState } from '../reducer';
import { formatBookData } from '../utils';
import PrevNextBar from './PrevNextBar';

jest.mock('../../../config', () => {
  const mockBook = (jest as any).requireActual('../../../test/mocks/archiveLoader').book;
  return {BOOKS: {
   [mockBook.id]: {defaultVersion: mockBook.version},
  }};
});

const book = formatBookData(archiveBook, mockCmsBook);

describe('PrevNextBar', () => {
  let store: Store;

  beforeEach(() => {
    const state = {
      content: initialState,
    } as any as AppState;
    store = createTestStore(state);
  });

  const render = () => <TestContainer store={store}>
    <PrevNextBar />
  </TestContainer>;

  it('renders `null` with no page or book', () => {
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when you pass a page and book', () => {
    store.dispatch(receivePage({...shortPage, references: []}));
    store.dispatch(receiveBook(book));
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders `null` when passed a page that isn\'t in the book tree', () => {
    store.dispatch(receivePage({...shortPage, id: 'asdfasdfasd', references: []}));
    store.dispatch(receiveBook(book));
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders only `next` element correctly', () => {
    store.dispatch(receivePage({...firstPage, references: []}));
    store.dispatch(receiveBook(book));
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders only `prev` element correctly', () => {
    store.dispatch(receivePage({...lastPage, references: []}));
    store.dispatch(receiveBook(book));
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
