import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { isAcceptCookiesNeeded } from '../../notifications/acceptCookies';
import { acceptCookies } from '../../notifications/actions';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { receiveUser } from '../actions';

export const trackUserHookBody: ActionHookBody<typeof receiveUser> = (middleware) => async({payload}) => {
  if (payload.isNotGdprLocation) {
    if (isAcceptCookiesNeeded()) {
      middleware.dispatch(acceptCookies());
    }

    googleAnalyticsClient.setUserId(payload.uuid);
  }
};

export default actionHook(receiveUser, trackUserHookBody);
