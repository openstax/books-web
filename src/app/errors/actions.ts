import { createStandardAction } from 'typesafe-actions';
import { ErrorAction } from './types';

export const recordError = createStandardAction('Errors/record')<ErrorAction>();

export const clearCurrentError = createStandardAction('Errors/clearCurrent')<void>();
