import createTestServices from '../../test/createTestServices';
import createTestStore from '../../test/createTestStore';
import { book as archiveBook } from '../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../test/mocks/osWebLoader';
import { reactAndFriends, resetModules, runHooksAsync } from '../../test/utils';
import { receiveBook } from '../content/actions';
import { formatBookData } from '../content/utils';
import createIntl from '../messages/createIntl';
import { AppServices, Store } from '../types';

const book = formatBookData(archiveBook, mockCmsBook);

// tslint:disable: variable-name
describe('MessageProvider', () => {
  let Provider: ReturnType<typeof reactAndFriends>['Provider'];
  let React: ReturnType<typeof reactAndFriends>['React'];
  let Services: ReturnType<typeof reactAndFriends>['Services'];
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let store: Store;
  let services: AppServices;
  let MessageProvider: any;

  beforeEach(() => {
    resetModules();

    store = createTestStore();
    services = {
      ...createTestServices(),
      // override the intl object normally used for testing
      intl: createIntl(),
    };
    ({Provider, React, renderer, Services} = reactAndFriends());
  });

  it('doesn\'t polyfill when api exists', async() => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
      loaded = true;
    });

    renderer.act(() => {
      store.dispatch(receiveBook(book));
    });

    MessageProvider = require('../messages/MessageProvider').default;

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider />
      </Services.Provider>
    </Provider>
    );

    component.update(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider />
      </Services.Provider>
    </Provider>);

    await runHooksAsync(renderer);

    expect(loaded).toBe(false);
  });

  describe('when api is not there', () => {

    beforeEach(() => {
      (Intl as any).PluralRules.polyfilled = true;
    });

    afterEach(() => {
      delete (Intl as any).PluralRules.polyfilled;
    });

    it('loads polyfill', async() => {
      let loaded = false;

      jest.doMock('@formatjs/intl-pluralrules/should-polyfill', () => ({
        shouldPolyfill: () => true,
      }));

      jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
        loaded = true;
      });

      MessageProvider = require('../messages/MessageProvider').default;

      renderer.act(() => {
        store.dispatch(receiveBook(book));
      });

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>
      );

      component.update(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>);

      await runHooksAsync(renderer);

      expect(loaded).toBe(true);
    });

    it('loads data', async() => {
      let loaded = false;

      jest.doMock('@formatjs/intl-pluralrules/should-polyfill', () => ({
        shouldPolyfill: () => true,
      }));
      jest.doMock('@formatjs/intl-pluralrules/locale-data/en', () => {
        loaded = true;
      });

      MessageProvider = require('../messages/MessageProvider').default;

      renderer.act(() => {
        store.dispatch(receiveBook(book));
      });

      const component = renderer.create(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>
      );

      component.update(<Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider />
        </Services.Provider>
      </Provider>);

      await runHooksAsync(renderer);

      expect(loaded).toBe(true);
    });
  });
});
