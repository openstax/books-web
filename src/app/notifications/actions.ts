import { createStandardAction } from 'typesafe-actions';
import { AnyNotification, Message } from './types';

export const updateAvailable = createStandardAction('Notification/updateAvailable')();
export const acceptCookies = createStandardAction('Notification/acceptCookies')();

export const receiveMessages = createStandardAction('Notification/receiveMessages')<Message[]>();

export const dismissNotification = createStandardAction('Notification/dismiss')<AnyNotification>();
