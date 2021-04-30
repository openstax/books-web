import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import * as Services from '../app/context/Services';
import MessageProvider from '../app/MessageProvider';
import { Store } from '../app/types';
import createTestServices from './createTestServices';
import createTestStore from './createTestStore';

interface TestContainerProps {
  services?: ReturnType<typeof createTestServices>;
  store?: Store;
  children: ReactNode;
}

// tslint:disable-next-line:variable-name max-line-length
const TestContainer = ({services = createTestServices(), store = createTestStore(), children}: TestContainerProps) =>
  <Provider store={store}>
    <Services.Provider value={services}>
      <MessageProvider>
        {children}
      </MessageProvider>
    </Services.Provider>
  </Provider>;

export default TestContainer;
