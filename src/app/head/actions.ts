import { createStandardAction } from 'typesafe-actions';
import { State } from './types';

export const setHead = createStandardAction('Head/set')<State>();
