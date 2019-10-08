import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let MessageProvider: ReturnType<typeof reactAndFriends>['MessageProvider']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name

  describe('in browser', () => {
    const reloadBackup = window!.location.reload;
    let reload: jest.SpyInstance;

    beforeEach(() => {
      reload = window!.location.reload = jest.fn();
      resetModules();
      ({React, renderer, MessageProvider} = reactAndFriends());
      UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
    });

    afterEach(() => {
      window!.location.reload = reloadBackup;
    });

    it('reloads on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(reload).toHaveBeenCalled();
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderer, MessageProvider} = reactAndFriends());
      UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('does nothing on click', () => {
      const component = renderer.create(<MessageProvider><UpdatesAvailable /></MessageProvider>);
      component.root.findByType('button').props.onClick();
      expect(() => component.root.findByType('button').props.onClick()).not.toThrow();
    });
  });
});
