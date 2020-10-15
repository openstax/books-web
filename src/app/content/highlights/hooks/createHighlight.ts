import { Highlight } from '@openstax/highlighter/dist/api';
import Sentry from '../../../../helpers/Sentry';
import { addToast } from '../../../notifications/actions';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';

export const hookBody: ActionHookBody<typeof createHighlight> =
  ({highlightClient, dispatch}) => async({payload, meta}) => {
    if (meta.revertingAfterFailure) { return; }

    try {
      await highlightClient.addHighlight({highlight: payload});
    } catch (error) {
      Sentry.captureException(error);

      dispatch(addToast({messageKey: 'i18n:notification:toast:highlights:create-failure'}));
      dispatch(receiveDeleteHighlight(payload as unknown as Highlight, {...meta, revertingAfterFailure: true}));
    }
  };

export default actionHook(createHighlight, hookBody);
