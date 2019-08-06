import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.errors
);

export const code = createSelector(
  localState,
  (state) => state.code
);
