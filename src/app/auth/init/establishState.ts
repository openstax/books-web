import { Initializer } from '../../types';
import { receiveLoggedOut, receiveUser } from '../actions';
import { formatUser } from '../utils';

const initializer: Initializer = async({dispatch, userLoader}) => {
  if (typeof(document) === 'undefined') {
    return;
  }

  const user = await userLoader.getCurrentUser();

  if (user) {
    dispatch(receiveUser(formatUser(user)));
  } else {
    dispatch(receiveLoggedOut());
  }
};

export default initializer;
