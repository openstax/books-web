import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { AnyRoute } from '../types';
import * as utils from '../utils';

const connectNavigationProvider = connect((state: AppState) => ({
  pathname: selectors.pathname(state),
}));

export default connectNavigationProvider(({routes, pathname}: {routes: AnyRoute[], pathname: string}) => {
  const match = utils.findRouteMatch(routes, pathname);

  if (match) {
    return React.createElement(match.route.component);
  } else {
    return null;
  }
});
