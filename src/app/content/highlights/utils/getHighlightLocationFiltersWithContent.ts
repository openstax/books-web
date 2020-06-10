import { getHighlightLocationFilterForPage } from '../../utils/sharedHighlightsUtils';
import { CountsPerSource, HighlightLocationFilters } from '../types';

export default (locationFilters: HighlightLocationFilters, totalCounts: CountsPerSource) => {

  return Object.entries(totalCounts).reduce((result, [pageId]) => {
    const location = getHighlightLocationFilterForPage(locationFilters, pageId);

    if (location && !result.has(location.id)) {
      result.add(location.id);
    }

    return result;
  }, new Set<string>());
};
