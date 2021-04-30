import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import { Store } from '../../types';
import { hideErrorDialog, recordSentryMessage } from '../actions';

import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {
  let store: Store;
  let error: Error;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    error = new Error('unknown error');
    store = createTestStore({ errors: { showDialog: true, error, sentryMessageIdStack: [] } });
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('matches snapshot', () => {
    const tree = renderer
      .create(<TestContainer store={store}><ErrorModal /></TestContainer>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshots with recorded error ids', () => {
    store.dispatch(recordSentryMessage('some-error-id'));
    const tree = renderer
      .create(<TestContainer store={store}><ErrorModal /></TestContainer>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('clears errors', () => {
    const tree = renderer.create(<TestContainer store={store}><ErrorModal /></TestContainer>);

    const btn = tree.root.findByProps({ 'data-testid': 'clear-error' });
    renderer.act(() => { btn.props.onClick(); });
    expect(dispatch).toHaveBeenCalledWith(hideErrorDialog());
  });
});
