import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import resolveContent from './resolveContent';
import trackPageView from './trackPageView';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  await resolveContent(services, action.match);
  await syncSearch(services)(action);
  await trackPageView(action.match);
};

export default hookBody;
