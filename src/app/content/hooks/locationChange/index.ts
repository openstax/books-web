import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import { locationChange } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { loadHighlights } from '../../highlights/hooks';
import { loadPracticeQuestions } from '../../practiceQuestions/hooks';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { loadStudyGuides } from '../../studyGuides/hooks';
import loadBuyPrintConfig from './buyPrintConfig';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  const state = services.getState();
  const pathname = selectNavigation.pathname(state);
  const query = selectNavigation.query(state);

  googleAnalyticsClient.trackPageView(pathname, query);

  await resolveContent(services, action.match);

  await Promise.all([
    syncSearch(services)(action),
    loadBuyPrintConfig(services)(),
    loadHighlights(services)(locationChange(action)),
    loadStudyGuides(services)(),
    loadPracticeQuestions(services)(),
  ]);
};

export default hookBody;
