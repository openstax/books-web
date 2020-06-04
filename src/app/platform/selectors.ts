import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.platform
);

export const isNative = createSelector(
  localState,
  (state) => state.type !== 'web'
);
