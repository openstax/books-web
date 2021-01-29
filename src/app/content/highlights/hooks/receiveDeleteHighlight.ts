import { NewHighlight } from '@openstax/highlighter/dist/api';
import { ensureApplicationErrorType } from '../../../../helpers/applicationMessageError';
import { getHighlightToastDesination } from '../../../notifications/utils';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import { createHighlight, receiveDeleteHighlight } from '../actions';
import { HighlightDeleteError } from '../errors';

export const hookBody: ActionHookBody<typeof receiveDeleteHighlight> =
  ({highlightClient, dispatch, getState}) => async({meta, payload}) => {
    if (meta.revertingAfterFailure) { return; }

    const destination = getHighlightToastDesination(getState());

    try {
      await highlightClient.deleteHighlight({id: payload.id});
    } catch (error) {
      dispatch(createHighlight(
        {
          ...payload as unknown as NewHighlight,
          id: payload.id,
        },
        {...meta, revertingAfterFailure: true}
      ));

      throw ensureApplicationErrorType(error, new HighlightDeleteError({ destination }));
    }
  };

export default actionHook(receiveDeleteHighlight, hookBody);
