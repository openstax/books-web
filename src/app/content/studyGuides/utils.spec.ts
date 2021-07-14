import { HighlightColorEnum } from '@openstax/highlights-client';
import { getFiltersFromQuery } from './utils';

describe('getFiltersFromQuery', () => {
  it('get multiple colors and locationIds from the query', () => {
    const output = getFiltersFromQuery({ colors: ['green', 'yellow', 'akljwef'], locationIds: ['1', '2'] });
    expect(output).toEqual({ colors: [HighlightColorEnum.Green, HighlightColorEnum.Yellow], locationIds: ['1', '2'] });
  });

  it('get single color and locationId from the query', () => {
    const output = getFiltersFromQuery({ colors: ['green'], locationIds: ['1'] });
    expect(output).toEqual({ colors: [HighlightColorEnum.Green], locationIds: ['1'] });
  });
});
