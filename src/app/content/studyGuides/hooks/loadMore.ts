import {
  GetHighlightsSetsEnum,
} from '@openstax/highlighter/dist/api';
import { ActionHookBody, AppServices, MiddlewareAPI } from '../../../types';
import { actionHook } from '../../../utils';
import { summaryPageSize } from '../../constants';
import { highlightLocationFilters } from '../../selectors';
import createLoader from '../../utils/highlightLoadingUtils';
import { loadMoreStudyGuides, receiveStudyGuidesSummary } from '../actions';
import { allColors } from '../constants';
import * as select from '../selectors';

export const loadMoreStudyGuidesHighlights = (services: MiddlewareAPI & AppServices, pageSize?: number) => {
  const state = services.getState();

  const locationFilters = highlightLocationFilters(state);
  const sourcesFetched = Object.keys(select.loadedCountsPerSource(state));
  const filteredCounts = select.filteredCountsPerPage(state);
  const previousPagination = select.studyGuidesPagination(state);

  const params = {
    colors: allColors,
    sets: [GetHighlightsSetsEnum.Curatedopenstax],
  };

  const studyGuidesLoader = createLoader(services, params);

  return studyGuidesLoader.loadSummary({
    countsPerSource: filteredCounts,
    locationFilters,
    pageSize,
    previousPagination,
    sourcesFetched,
  });
};

const hookBody: ActionHookBody<typeof loadMoreStudyGuides> = (services) => async() => {
  const {formattedHighlights, pagination} = await loadMoreStudyGuidesHighlights(services, summaryPageSize);
  services.dispatch(receiveStudyGuidesSummary(formattedHighlights, pagination));
};

export const loadMoreHook = actionHook(loadMoreStudyGuides, hookBody);
