import { receiveLoggedOut } from '../auth/actions';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

const hookBody: ActionHookBody<typeof receiveLoggedOut> = () => async({}) => {
  googleAnalyticsClient.setUserId(undefined);
};

export default actionHook(receiveLoggedOut, hookBody);
