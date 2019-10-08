import { getType } from 'typesafe-actions';
import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { clearAcceptCookies, doAcceptCookies } from '../../notifications/acceptCookies';
import { acceptCookies } from '../../notifications/actions';
import { receiveUser } from '../actions';
import { User } from '../types';
import { trackUserHookBody } from './trackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;
  const dispatchMock = jest.fn();
  const helpers: any = {dispatch: dispatchMock};
  let user: User;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
    client.setTrackingIds(['foo']);
    user = {firstName: 'test', isNotGdprLocation: true, uuid: 'a_uuid'};
    jest.resetAllMocks();
  });

  describe('user not in GDPR', () => {
    beforeEach(() => {
      user.isNotGdprLocation = true;
    });

    describe('user already accepted Cookies', () => {
      beforeEach(() => {
        doAcceptCookies();
      });

      it('tracks the user', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userId', 'a_uuid');
      });

      it('does not prompt to accept cookies', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(dispatchMock).not.toHaveBeenCalled();
      });
    });

    describe('user not yet accepted cookies', () => {
      beforeEach(() => {
        clearAcceptCookies();
      });

      it('tracks the user', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userId', 'a_uuid');
      });

      it('prompts to accept cookies', async() => {
        await (trackUserHookBody(helpers))(receiveUser(user));
        expect(dispatchMock).toHaveBeenCalledWith({
          meta: undefined,
          payload: undefined,
          type: getType(acceptCookies),
        });
      });
    });
  });

  describe('user in the GDPR', () => {
    beforeEach(() => {
      user.isNotGdprLocation = false;
    });

    it('does not track the user', async() => {
      await (trackUserHookBody(helpers))(receiveUser(user));
      expect(mockGa).not.toHaveBeenCalled();
    });

    it('does not prompt to accept cookies', async() => {
      await (trackUserHookBody(helpers))(receiveUser(user));
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });

});
