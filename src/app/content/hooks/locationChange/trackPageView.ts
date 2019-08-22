import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import { Match } from '../../../navigation/types';
import { content } from '../../routes';

import { assertWindow } from '../../../../app/utils';

export default async(match: Match<typeof content>) => {
  // match.route.getUrl(match.params) is the path, how to get the domain?
  console.log(match); // to hide unused variable error
  googleAnalyticsClient.trackPageView(assertWindow().location.href);
};
