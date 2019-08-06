import { History } from 'history';
import { getType } from 'typesafe-actions';
import { AnyAction, Dispatch, Middleware } from '../types';
import * as actions from './actions';
import { hasState } from './guards';
import { AnyRoute } from './types';
import { changeToLocation, matchUrl } from './utils';

export default (routes: AnyRoute[], history: History): Middleware => ({dispatch}) => {
  history.listen(changeToLocation(routes, dispatch));

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    history[action.payload.method]({
      hash: action.payload.hash,
      pathname: matchUrl(action.payload),
      search: action.payload.search,
      state: hasState(action.payload)
        ? action.payload.state
        : undefined,
    });
  };
};
