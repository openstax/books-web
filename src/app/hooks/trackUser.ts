import { receiveUser } from '../auth/actions';
import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { ActionHookBody } from '../types';
import { actionHook } from '../utils';

const hookBody: ActionHookBody<typeof receiveUser> = () => async({payload}) => {
  googleAnalyticsClient.setUserId(payload.uuid);
};

export default actionHook(receiveUser, hookBody);
