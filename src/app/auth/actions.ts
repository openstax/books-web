import { createStandardAction } from 'typesafe-actions';
import { User } from './types';

export const receiveUser = createStandardAction('Auth/receiveUser')<User>();
export const receiveLoggedOut = createStandardAction('Auth/receiveLoggedOut')();
