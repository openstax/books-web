import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.head
);

export const meta = createSelector(
  localState,
  (state) => state.meta
);

export const links = createSelector(
  localState,
  (state) => state.links
);

export const title = createSelector(
  localState,
  (state) => state.title
);
