import { resetModules } from '../test/utils';

describe('MessageProvider', () => {

  beforeEach(() => {
    resetModules();
  });

  it('doesn\'t polyfill when api exists', () => {
    let loaded = false;

    jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
      loaded = true;
    });
    require('./MessageProvider');

    expect(loaded).toBe(false);
  });

  describe('when api is not there', () => {
    const backup = Intl.PluralRules;

    beforeEach(() => {
      /// @ts-ignore
      delete Intl.PluralRules;
    });

    afterEach(() => {
      /// @ts-ignore
      Intl.PluralRules = backup;
    });

    it('loads polyfill', () => {
      let loaded = false;

      jest.doMock('@formatjs/intl-pluralrules/polyfill', () => {
        loaded = true;
      });
      require('./MessageProvider');

      expect(loaded).toBe(true);
    });
  });

});
