import { createSelector } from 'reselect';
import { hasOSWebData } from '../../app/content/guards';
import * as selectContent from '../../app/content/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX search';

export const selector = createSelector(
  selectContent.book,
  (book) => ({book})
);

export const track = (
  {book}: ReturnType<typeof selector>,
  search: string,
  isResultReload: boolean
): AnalyticsEvent | void => {
  const slug = book && hasOSWebData(book) ? book.slug : 'unknown';

  if (isResultReload) {
    return;
  }

  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: search,
      eventCategory: eventName,
      eventLabel: slug,
    }),
  };
};
