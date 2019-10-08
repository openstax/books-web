import { isFuture, isPast } from 'date-fns';
import { isAppMessageDismissed } from './dismissAppMessages';
import { Message } from './types';

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
