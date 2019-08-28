import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { receiveUser } from '../auth/actions';
import { isAcceptCookiesNeeded } from '../notifications/acceptCookies';
import { acceptCookies } from '../notifications/actions';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

export const trackUserHookBody: ActionHookBody<typeof receiveUser> = (middleware) => async({payload}) => {
  if (isAcceptCookiesNeeded()) {
    middleware.dispatch(acceptCookies());
  }

  if (payload.isNotGdprLocation) {
    googleAnalyticsClient.setUserId(payload.uuid);
  }
};

export default actionHook(receiveUser, trackUserHookBody);
