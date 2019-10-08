import { getType } from 'typesafe-actions';
import { locationChange } from '../../navigation/actions';
import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { acceptCookies, dismissNotification } from '../actions';
import * as select from '../selectors';

export const hideAcceptCookiesOnNavigateHookBody: ActionHookBody<typeof locationChange> =
  (middleware) => () => {
    const notifications = select.notifications(middleware.getState());
    const acceptCookiesNotification = notifications.find((notification) =>
      notification.type === getType(acceptCookies)
    );

    if (acceptCookiesNotification) {
      middleware.dispatch(dismissNotification(acceptCookiesNotification));
    }
  };

export default actionHook(locationChange, hideAcceptCookiesOnNavigateHookBody);
