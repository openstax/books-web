import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  await resolveContent(services, action.match);
  await syncSearch(services)(action);
};

export default hookBody;
