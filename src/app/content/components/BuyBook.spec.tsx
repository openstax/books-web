import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { receiveBuyPrintConfig } from '../actions';
import BuyBook from './BuyBook';

describe('BuyBook', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders when config is available', () => {
    store.dispatch(receiveBuyPrintConfig({url: 'https://example.com', disclosure: 'asdf'}));
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('returns null', () => {
    const component = renderer.create(<TestContainer store={store}>
      <BuyBook />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
