import { createStandardAction } from 'typesafe-actions';
import { State } from './types';

export const setPlatform = createStandardAction('Native/set')<State['type']>();
