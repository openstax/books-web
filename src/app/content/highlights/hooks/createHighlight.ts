import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, deleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> =
  ({highlightClient, dispatch}) => async({payload, meta}) => {
    if (meta.failedToSave) { return; }

    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast('i18n:notification:toast:highlights:create-failure'));
      dispatch(deleteHighlight(payload.id, {...meta, failedToSave: true}));
    }
  };

export default actionHook(createHighlight, hookBody);
