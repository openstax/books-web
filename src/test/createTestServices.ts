import { SearchApi } from '@openstax/open-search-client';
import { createMemoryHistory } from 'history';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import mockArchiveLoader from './mocks/archiveLoader';
import mockOsWebLoader from './mocks/osWebLoader';
import mockUserLoader from './mocks/userLoader';
jest.mock('@openstax/open-search-client');

const services = () => ({
  archiveLoader: mockArchiveLoader(),
  fontCollector: new FontCollector(),
  history: createMemoryHistory(),
  osWebLoader: mockOsWebLoader(),
  promiseCollector: new PromiseCollector(),
  searchClient: new SearchApi(),
  userLoader: mockUserLoader(),
});

export default services;
