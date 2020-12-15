import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import MessageProvider from '../../MessageProvider';
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
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <BuyBook />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('returns null', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <BuyBook />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
