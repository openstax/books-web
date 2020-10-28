import { isFuture, isPast } from 'date-fns';
import { myHighlightsOpen } from '../content/highlights/selectors';
import { AppState } from '../types';
import { assertDefined } from '../utils';
import { isAppMessageDismissed } from './dismissAppMessages';
import { Message, ToastNotification } from './types';

export const shouldLoadAppMessage = (message: Message) => {
  if (message.start_at && isFuture(new Date(message.start_at))) {
    return false;
  }
  if (message.end_at && isPast(new Date(message.end_at))) {
    return false;
  }

  if (isAppMessageDismissed(message)) {
    return false;
  }

  return true;
};

export const getHighlightToastDesination = (state: AppState): ToastNotification['destination'] =>
  myHighlightsOpen(state) ? 'myHighlights' : 'page';

export const groupToasts = (toasts: ToastNotification[]) => toasts.reduce((grouped, toast) => {
  if (toast.destination in grouped) {
    assertDefined(grouped[toast.destination], 'Key disappeared from an object').push(toast);
  } else {
    grouped[toast.destination] = [toast];
  }
  return grouped;
}, {} as {[key in ToastNotification['destination']]?: ToastNotification[]});
