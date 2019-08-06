import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { Route } from '../navigation/types';
import { Params } from './types';

const CONTENT_PATH = '/books/:book/pages/:page';

interface State {
  bookUid: string;
  bookVersion: string;
  pageUid: string;
  search?: string | null;
}

export const content: Route<Params, State> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "Content" */ './components/Content'),
    loading: () => null,
    modules: ['Content'],
  }),
  getUrl: (params: Params): string => pathToRegexp.compile(CONTENT_PATH)(params),
  name: 'Content',
  paths: [CONTENT_PATH],
};
