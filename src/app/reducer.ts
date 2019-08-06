import { History } from 'history';
import { combineReducers } from 'redux';
import auth, {initialState as authInitialState } from './auth/reducer';
import content, {initialState as contentInitialState } from './content/reducer';
import errors, {initialState as errorsInitialState } from './errors/reducer';
import head, {initialState as headInitialState } from './head/reducer';
import navigation from './navigation/reducer';
import notifications, {initialState as notificationsInitialState } from './notifications/reducer';
import { AnyAction, AppState } from './types';

export const initialState = {
  auth: authInitialState,
  content: contentInitialState,
  errors: errorsInitialState,
  head: headInitialState,
  notifications: notificationsInitialState,
};

export default (history: History) => combineReducers<AppState, AnyAction>({
  auth,
  content,
  errors,
  head,
  navigation: navigation(history.location),
  notifications,
});
