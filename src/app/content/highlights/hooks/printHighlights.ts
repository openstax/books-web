import { ActionHookBody, AppServices, MiddlewareAPI, Unpromisify } from '../../../types';
import { actionHook, assertWindow } from '../../../utils';
import { printSummaryHighlights, receiveSummaryHighlights, toggleSummaryHighlightsLoading } from '../actions';
import { HighlightPopupPrintError } from '../errors';
import { myHighlightsOpen } from '../selectors';
import { loadMore, LoadMoreResponse } from './loadMore';

let waitingForPromiseCollector = false;

export const asyncHelper = async(services: MiddlewareAPI & AppServices ) => {
  let response: Unpromisify<LoadMoreResponse>;

  try {
    response = await loadMore(services);
  } catch (error) {
    services.dispatch(toggleSummaryHighlightsLoading(false));

    // TODO: This should check for instanceof CustomApplicationError but it doesn't work in tests
    if (error.name === 'CustomApplicationError') {
      throw error;
    }

    throw new HighlightPopupPrintError({ destination: 'myHighlights' });
  }

  const {formattedHighlights} = response;
  services.dispatch(receiveSummaryHighlights(formattedHighlights, {
    isStillLoading: true,
    pagination: null,
  }));

  if (waitingForPromiseCollector) {
    // wait for content to process/load
    await services.promiseCollector.calm();
    waitingForPromiseCollector = false;
  }

  services.dispatch(toggleSummaryHighlightsLoading(false));

  if (myHighlightsOpen(services.getState())) {
    assertWindow().print();
  }
};

export const hookBody: ActionHookBody<typeof printSummaryHighlights> = (services) => () => {
  // TODO: refactor this somehow
  // do not return promise, otherwise `services.promiseCollector.calm()` will end up waiting for itself
  waitingForPromiseCollector = true;
  return asyncHelper(services);
};

export const printHighlightsHook = actionHook(printSummaryHighlights, hookBody);
