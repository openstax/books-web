import { createStandardAction } from 'typesafe-actions';

export const recordError = createStandardAction('Errors/record')<Error>();

export const clearCurrentError = createStandardAction('Errors/clearCurrent')<void>();
