import { getType } from 'typesafe-actions';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { updateQuery } from '../../../navigation/utils';
import { ActionHookBody } from '../../../types';
import updateSummaryFilters from '../../highlights/utils/updateSummaryFilters';
import * as actions from '../actions';
import { summaryFilters } from '../selectors';

export const hookBody: ActionHookBody<
  typeof actions.setDefaultSummaryFilters |
  typeof actions.updateSummaryFilters
> = (services) => (action) => {
  const state = services.getState();
  const existingQuery = navigation.query(state);
  const match = navigation.match(state);
  const filters = summaryFilters(state);

  if (!match) { return; }

  const updatedFilters = action.type === getType(actions.setDefaultSummaryFilters)
    ? action.payload
    : updateSummaryFilters(filters, action.payload);
  services.dispatch(replace(match, {
    search: updateQuery(updatedFilters as any as Record<string, string[]>, existingQuery),
  }));
};
