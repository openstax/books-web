import { SummaryFilters, SummaryFiltersUpdate } from '../types';

const updateSummaryFilters = (filters: SummaryFilters, update: Partial<SummaryFiltersUpdate>): SummaryFilters => {
  const newFilters = {...filters};
  const { colors: colorsChange, locations: locationsChange } = update;

  if (colorsChange) {
    if (colorsChange.remove.length) {
      newFilters.colors = newFilters.colors.filter((color) => !colorsChange.remove.includes(color));
    }
    newFilters.colors = Array.from(new Set([...newFilters.colors, ...colorsChange.new]));
  }

  if (locationsChange) {
    if (locationsChange.remove.length) {
      newFilters.locationIds = newFilters.locationIds.filter(
        (id) => !locationsChange.remove.find((location) => id === location.id));
    }
    newFilters.locationIds = Array.from(
      new Set([...newFilters.locationIds, ...locationsChange.new.map((location) => location.id)])
    );
  }

  return newFilters;
};

export default updateSummaryFilters;
