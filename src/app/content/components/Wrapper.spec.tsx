import React from 'react';
import renderer from 'react-test-renderer';
import { Wrapper } from './Wrapper';

describe('wrapper', () => {
  it('matches snapshot', () => {
    const tree = renderer.create(<Wrapper />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with search open', () => {
    const tree = renderer.create(<Wrapper hasQuery searchResultsOpen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
