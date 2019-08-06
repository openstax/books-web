import React from 'react';
import { routes } from '../..';
import { H3 } from '../../components/Typography';
import Panel from './Panel';

// tslint:disable-next-line:variable-name
const Routes: React.SFC = () => <Panel title='Routes'>
  {routes.map((route) => <div key={route.name}>
    <H3>{route.name}</H3>
    path: {route.paths}
  </div>)}
</Panel>;

export default Routes;
