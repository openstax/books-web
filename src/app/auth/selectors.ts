import { createSelector } from 'reselect';
import * as selectNavigation from '../navigation/selectors';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.auth
);

export const user = createSelector(
  localState,
  (state) => state.user
);

export const established = createSelector(
  localState,
  (state) => state.established
);

export const loggedOut = createSelector(
  localState,
  user,
  (state, currentUser) => state.established && !currentUser
);

export const loginLink = createSelector(
  selectNavigation.pathname,
  (currentPath) => '/accounts/login?r=' + currentPath
);
