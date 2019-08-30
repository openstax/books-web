import {
  differenceInDays,
  endOfToday,
} from 'date-fns';
import * as Cookies from 'js-cookie';
import { Message } from './types';

const messageDismissedPrefix: string = 'message_dismissed';
const getMessageKey = (message: Message) => `${messageDismissedPrefix}_${message.id}`;

export const dismissAppMessage = (message: Message) => {
  const daysToExpire = message.end_at
    ? differenceInDays(new Date(message.end_at), endOfToday()) + 7
    : 60
  ;

  Cookies.set(getMessageKey(message), 'true', { expires: daysToExpire });
};

export const isAppMessageDismissed = (message: Message) => {
  return !!Cookies.get(getMessageKey(message));
};
