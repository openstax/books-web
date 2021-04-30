import { reactAndFriends, resetModules } from '../../../test/utils';

describe('UpdatesAvailable', () => {
  const reloadBackup = window!.location.reload;
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let TestContainer: ReturnType<typeof reactAndFriends>['TestContainer']; // tslint:disable-line:variable-name
  let UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
  let serviceWorkerNeedsUpdate: jest.SpyInstance;
  let reload: jest.SpyInstance;

  beforeEach(() => {
    reload = window!.location.reload = jest.fn();
    resetModules();
    ({React, renderer, TestContainer} = reactAndFriends());
    UpdatesAvailable = require('./UpdatesAvailable').default; // tslint:disable-line:variable-name
    serviceWorkerNeedsUpdate = jest.spyOn(require('../../../helpers/applicationUpdates'), 'serviceWorkerNeedsUpdate');
  });

  afterEach(() => {
    window!.location.reload = reloadBackup;
  });

  it('reloads on click', () => {
    const component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    component.root.findByType('button').props.onClick();
    expect(reload).toHaveBeenCalled();
  });

  it('doesn\'t render until reload is ready', () => {
    serviceWorkerNeedsUpdate.mockReturnValue(true);
    const component = renderer.create(<TestContainer><UpdatesAvailable /></TestContainer>);
    expect(component.root.findAllByType('button').length).toBe(0);
  });
});
