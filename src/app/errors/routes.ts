import Loadable from 'react-loadable';
import { Route } from '../navigation/types';

const CATCH_ALL = '/(.*)';

export const notFound: Route<undefined> = {
  component: Loadable({
    loader: () => import(/* webpackChunkName: "PageNotFound" */ './components/PageNotFound'),
    loading: () => null,
    modules: ['PageNotFound'],
    webpack: /* istanbul ignore next */ () => [(require as any).resolveWeak('./components/PageNotFound')],
  }),
  getUrl: () => '/errors/404',
  name: 'NotFound',
  paths: [CATCH_ALL],
};
