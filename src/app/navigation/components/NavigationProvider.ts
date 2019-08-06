import { Location } from 'history';
import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { AnyRoute } from '../types';
import * as utils from '../utils';

const connectNavigationProvider = connect((state: AppState) => ({
  location: selectors.location(state),
}));

export default connectNavigationProvider(({routes, location}: {routes: AnyRoute[], location: Location}) => {
  const match = utils.findRouteMatch(routes, location);

  if (match) {
    return React.createElement(match.route.component);
  } else {
    return null;
  }
});
