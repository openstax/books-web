import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import TestContainer from '../../../test/TestContainer';
import Home from './Home';

describe('Home', () => {
  it('matches snapshot', async() => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2021);
    const store = createTestStore({navigation: new URL('https://localhost')});
    const component = renderer.create(<TestContainer store={store}>
      <Home />
    </TestContainer>);

    // defer promises...
    await new Promise((resolve) => setTimeout(resolve, 1));

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
