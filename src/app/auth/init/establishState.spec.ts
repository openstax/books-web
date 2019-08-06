import createTestServices from '../../../test/createTestServices';
import { testAccountsUser } from '../../../test/mocks/userLoader';
import { AppServices, MiddlewareAPI } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';
import establishState from './establishState';

describe('auth establishState', () => {
  let services: AppServices & MiddlewareAPI;

  beforeEach(() => {
    services = {
      ...createTestServices(),
      dispatch: jest.fn(),
      getState: jest.fn(),
    };
  });

  it('dispatches authenticated user', async() => {
    services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(testAccountsUser));

    establishState(services);
    await Promise.resolve();

    expect(services.dispatch).toHaveBeenCalledWith(receiveUser(formatUser(testAccountsUser)));
  });

  it('dispatches logged out', async() => {
    services.userLoader.getCurrentUser = jest.fn(() => Promise.resolve(undefined));

    establishState(services);
    await Promise.resolve();

    expect(services.dispatch).toHaveBeenCalledWith(receiveLoggedOut());
  });
});
