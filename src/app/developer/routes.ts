import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const ROUTES_PATH = '/';

export const developerHome: Route = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "DeveloperHome" */ './components/Home'),
    loading: () => null,
    modules: ['DeveloperHome'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/Home')],
  }),
  getUrl: (): string => pathToRegexp.compile(ROUTES_PATH)(),
  locale: 'en',
  name: 'Developer Home',
  paths: [ROUTES_PATH, '/books/list'],
};
