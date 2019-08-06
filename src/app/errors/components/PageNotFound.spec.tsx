import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../MessageProvider';
import PageNotFound from './PageNotFound';

describe('PageNotFound', () => {
  it('matches snapshot', () => {
    const tree = renderer
      .create(<MessageProvider><PageNotFound /></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
