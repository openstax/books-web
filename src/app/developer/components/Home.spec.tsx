import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import mockArchiveLoader from '../../../test/mocks/archiveLoader';
import mockOSWebLoader from '../../../test/mocks/osWebLoader';
import * as Services from '../../context/Services';
import MessageProvider from '../../MessageProvider';
import { AppServices } from '../../types';
import Home from './Home';

describe('Home', () => {
  let archiveLoader: AppServices['archiveLoader'];
  let osWebLoader: AppServices['osWebLoader'];
  const services = {} as AppServices;

  beforeEach(() => {
    archiveLoader = mockArchiveLoader();
    osWebLoader = mockOSWebLoader();
    (services as any).archiveLoader = archiveLoader;
    (services as any).osWebLoader = osWebLoader;
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
