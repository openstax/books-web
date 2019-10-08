import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../MessageProvider';
import ErrorCard from './ErrorCard';

describe('ErrorCard', () => {

  it('matches snapshot', () => {
    const tree = renderer
      .create(<MessageProvider><ErrorCard /></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
