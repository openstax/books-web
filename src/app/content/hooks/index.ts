import { routeHook } from '../../navigation/utils';
import { actionHook } from '../../utils';
import * as actions from '../actions';
import * as routes from '../routes';
import searchHooks from '../search/hooks';
import locationChangeBody from './locationChange';
import receiveContentBody from './receiveContent';

export default [
  ...searchHooks,
  routeHook(routes.content, locationChangeBody),
  actionHook(actions.receivePage, receiveContentBody),
  actionHook(actions.receiveBook, receiveContentBody),
];
