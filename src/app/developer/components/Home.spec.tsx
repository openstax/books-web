import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import Home from './Home';

describe('Home', () => {
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
  });

  it('matches snapshot', async() => {
    const store = createTestStore({navigation: new URL('https://localhost')});
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <Home />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    // defer promises...
    await new Promise((resolve) => setTimeout(resolve, 1));

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
