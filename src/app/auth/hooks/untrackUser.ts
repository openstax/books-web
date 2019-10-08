import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { receiveLoggedOut } from '../actions';

export const untrackUserHookBody: ActionHookBody<typeof receiveLoggedOut> = () => async() => {
  googleAnalyticsClient.unsetUserId();
};

export default actionHook(receiveLoggedOut, untrackUserHookBody);
