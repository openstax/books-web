import { createSelector } from 'reselect';
import { hasOSWebData } from '../../app/content/guards'
import * as selectContent from '../../app/content/selectors';
import * as selectNavigation from '../../app/navigation/selectors';
import { AnalyticsEvent } from './event';

const eventName = 'REX print';

export const selector = createSelector(
  selectContent.book,
  selectNavigation.pathname,
  (book, pathname) => ({book, pathname})
);

export const track = (
  {book, pathname}: ReturnType<typeof selector>
): AnalyticsEvent | void => {
  const slug = book && hasOSWebData(book) ? book.slug : 'unknown';

  return {
    getGoogleAnalyticsPayload: () => ({
      eventAction: slug,
      eventCategory: eventName,
      eventLabel: pathname,
    }),
  };
};
