import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.auth
);

export const user = createSelector(
  localState,
  (state) => state.user
);

export const loggedOut = createSelector(
  localState,
  user,
  (state, currentUser) => state.established && !currentUser
);
