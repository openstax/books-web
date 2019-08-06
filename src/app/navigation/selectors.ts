import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.navigation
);

export const pathname = createSelector(
  localState,
  (state) => state.pathname
);

export const hash = createSelector(
  localState,
  (state) => state.hash
);

export const location = localState;
