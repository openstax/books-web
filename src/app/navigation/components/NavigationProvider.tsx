import { Location } from 'history';
import React from 'react';
import { connect } from 'react-redux';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { AnyRoute } from '../types';
import * as utils from '../utils';

const connectNavigationProvider = connect((state: AppState) => ({
  location: selectors.location(state),
}));

export default connectNavigationProvider(({ routes, location }: { routes: AnyRoute[], location: Location }) => {
  const match = utils.findRouteMatch(routes, location);

  if (match) {
    // tslint:disable-next-line:variable-name
    const Component = match.route.component;
    return <ErrorBoundary><Component /></ErrorBoundary >;
  } else {
    return null;
  }
});
