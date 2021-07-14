import { HighlightColorEnum } from '@openstax/highlights-client';
import { OutputParams } from 'query-string';
import { colorFilterQueryParameterName, locationIdsFilterQueryParameterName } from '../constants';
import { colorfilterLabels } from './constants';

export const getFiltersFromQuery = (query: OutputParams) => {
  const queryColors = query[colorFilterQueryParameterName] as HighlightColorEnum | HighlightColorEnum[] | undefined;
  const queryLocationIds = query[locationIdsFilterQueryParameterName] as string | string[] | undefined;

  const colors = (Array.isArray(queryColors) ? queryColors : [queryColors])
    .filter((color) => color && colorfilterLabels.has(color)) as HighlightColorEnum[];

  const locationIds = (Array.isArray(queryLocationIds) ? queryLocationIds : [queryLocationIds])
    .filter((id) => id) as string[];

  return { colors, locationIds };
};
