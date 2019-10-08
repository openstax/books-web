import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import { ActionHookBody } from '../../../types';
import { actionHook } from '../../../utils';
import * as select from '../../selectors';
import { requestSearch } from '../actions';

export const trackSearchHookBody: ActionHookBody<typeof requestSearch> = ({getState}) => async(theSearchRequest) => {
  const state = getState();
  const book = select.book(state);
  const slug = book ? book.slug : 'unknown';

  if (!theSearchRequest.meta || !theSearchRequest.meta.isResultReload) {
    googleAnalyticsClient.trackEvent('REX search', theSearchRequest.payload, slug);
  }
};

export default actionHook(requestSearch, trackSearchHookBody);
