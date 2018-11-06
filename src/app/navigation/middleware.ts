import {MiddlewareAPI, Middleware, Dispatch} from 'redux';
import {History} from 'history';
import {getType} from 'typesafe-actions';
import * as actions from './actions';
import {findRouteMatch} from './utils';

export default (routes: Route[], history: History): Middleware => ({dispatch}: MiddlewareAPI) => {
  history.listen(location => {
    const match = findRouteMatch(routes, location.pathname);
    dispatch(actions.locationChange({location, match}));
  });

  return (next: Dispatch) => (action: AnyAction) => {
    if (action.type !== getType(actions.callHistoryMethod)) {
      return next(action);
    }

    history[action.payload.method](action.payload.args.url);
  };
};
