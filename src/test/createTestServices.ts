import { SearchApi } from '@openstax/open-search-client';
import { createMemoryHistory } from 'history';
import { BuyPrintResponse } from '../gateways/createBuyPrintConfigLoader';
import createHighlightClient from '../gateways/createHighlightClient';
import createPracticeQuestionsLoader from '../gateways/createPracticeQuestionsLoader';
import analytics from '../helpers/analytics';
import FontCollector from '../helpers/FontCollector';
import PromiseCollector from '../helpers/PromiseCollector';
import mockArchiveLoader from './mocks/archiveLoader';
import mockOsWebLoader from './mocks/osWebLoader';
import mockUserLoader from './mocks/userLoader';

jest.mock('@openstax/open-search-client');
jest.mock('@openstax/highlighter/dist/api');

const services = () => ({
  analytics,
  archiveLoader: mockArchiveLoader(),
  buyPrintConfigLoader: {load: jest.fn(() => Promise.resolve({
    buy_urls: [{url: 'https://example.com', disclosure: null}],
  } as BuyPrintResponse))},
  fontCollector: new FontCollector(),
  highlightClient: createHighlightClient('asdf'),
  history: createMemoryHistory(),
  osWebLoader: mockOsWebLoader(),
  practiceQuestionsLoader: createPracticeQuestionsLoader(),
  promiseCollector: new PromiseCollector(),
  searchClient: new SearchApi(),
  userLoader: mockUserLoader(),
});

export default services;
