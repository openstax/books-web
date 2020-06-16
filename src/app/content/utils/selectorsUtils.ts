import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import mapValues from 'lodash/fp/mapValues';
import merge from 'lodash/fp/merge';
import omit from 'lodash/fp/omit';
import reduce from 'lodash/fp/reduce';
import size from 'lodash/fp/size';
import values from 'lodash/fp/values';
import { assertDefined } from '../../utils';
import {
  filterCountsPerSourceByColorFilter,
  filterCountsPerSourceByLocationFilter
} from '../highlights/utils/paginationUtils';
import { CountsPerSource, HighlightLocationFilters, SummaryHighlights, SummaryHighlightsPagination } from '../types';

export const filterCounts = (
  totalCounts: CountsPerSource,
  locationFilters: HighlightLocationFilters,
  colorFilters: Set<HighlightColorEnum>
) => {
  return flow(
    (counts) => filterCountsPerSourceByLocationFilter(locationFilters, counts),
    (counts) => filterCountsPerSourceByColorFilter([...colorFilters], counts)
  )(totalCounts);
};

export const getSelectedHighlightsLocationFilters = (
  locationFilters: HighlightLocationFilters,
  selectedIds: Set<string>
  ) => [...selectedIds].reduce((result, selectedId) =>
  result.set(selectedId, assertDefined(locationFilters.get(selectedId), 'location filter id not found'))
, new Map() as HighlightLocationFilters);

export const getLoadedCountsPerSource = (sources: SummaryHighlights | null) => flow(
  values,
  reduce(merge, {}),
  mapValues(size)
)(sources);

export const checkIfHasMoreResults = (loaded: any, filteredCounts: any, pagination: SummaryHighlightsPagination) => {
  return !!(pagination || Object.keys(omit(Object.keys(loaded), filteredCounts)).length);
};
