import noop from 'lodash/fp/noop';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { resetModules } from '../../../../../test/utils';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import { assertWindow } from '../../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights } from '../../actions';
import { ConnectedPrintButton } from './Filters';

describe('HighlightsPrintButton', () => {
  let store: Store;
  let storeDispatch: jest.SpyInstance;
  let print: jest.SpyInstance;

  beforeEach(() => {
    resetModules();
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);

    store = createTestStore();

    storeDispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedPrintButton />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('dispatches action to print highlights', () => {
    store.dispatch(receiveSummaryHighlights({}, {pagination: {} as any}));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedPrintButton />
      </MessageProvider>
    </Provider>);

    storeDispatch.mockClear();

    const renderedPrintButton = component.root.findByProps({'data-testid': 'print'});

    renderer.act(() => {
      renderedPrintButton.props.onClick();
    });

    expect(storeDispatch).toHaveBeenCalledWith(printSummaryHighlights());
  });

  it('disables print button if summary is loading', () => {
    store.dispatch(receiveSummaryHighlights({}, {} as any));
    store.dispatch(printSummaryHighlights());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedPrintButton />
      </MessageProvider>
    </Provider>);

    storeDispatch.mockClear();

    const button = component.root.findByProps({'data-testid': 'print'});
    expect(button.props.disabled).toBe(true);
  });

  it('doesn\'t dispatch if all highlights have been loaded', () => {
    store.dispatch(receiveSummaryHighlights({}, {
      pagination: null,
    }));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <ConnectedPrintButton />
      </MessageProvider>
    </Provider>);

    storeDispatch.mockClear();

    const renderedPrintButton = component.root.findByProps({'data-testid': 'print'});

    renderer.act(() => {
      renderedPrintButton.props.onClick();
    });

    expect(storeDispatch).not.toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
  });
});
