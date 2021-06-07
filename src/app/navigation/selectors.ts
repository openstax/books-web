import { pickBy } from 'lodash/fp';
import { createSelector } from 'reselect';
import { isDefined } from '../guards';
import * as parentSelectors from '../selectors';
import { getScrollTargetFromQuery } from './utils';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.navigation
);

export const locationState = createSelector(
  localState,
  (state) => state.state
);

export const pathname = createSelector(
  localState,
  (state) => state.pathname
);

export const query = createSelector(
  localState,
  (state) => state.query
);

export const hash = createSelector(
  localState,
  (state) => state.hash
);

export const scrollTarget = createSelector(
  query,
  hash,
  getScrollTargetFromQuery
);

export const match = createSelector(
  localState,
  (state) => state.match
);

export const persistentQueryParameters = createSelector(
  query,
  (navQuery) => pickBy(isDefined, {
    'content-style': navQuery['content-style'] as string | undefined,
  })
);

export const location = localState;
