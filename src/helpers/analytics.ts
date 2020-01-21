import { findFirstAncestorOrSelfOfType } from '../app/domUtils';
import { Store } from '../app/types';
import googleAnalyticsClient from '../gateways/googleAnalyticsClient';
import * as clickButton from './analyticsEvents/clickButton';
import * as clickLink from './analyticsEvents/clickLink';
import { AnalyticsEvent } from './analyticsEvents/event';
import * as highlightingCreateNote from './analyticsEvents/highlighting/createNote';
import * as highlightingEditColor from './analyticsEvents/highlighting/editColor';
import * as highlightingEditAnnotation from './analyticsEvents/highlighting/editNote';
import * as pageFocus from './analyticsEvents/pageFocus';
import * as print from './analyticsEvents/print';
import * as search from './analyticsEvents/search';
import * as unload from './analyticsEvents/unload';

const triggerEvent = <Args extends any[]>(event: (...args: Args) => (AnalyticsEvent | void)) => (...args: Args) => {
  const analyticsEvent = event(...args);

  if (analyticsEvent) {
    console.log(analyticsEvent.getGoogleAnalyticsPayload());
    googleAnalyticsClient.trackEventPayload(analyticsEvent.getGoogleAnalyticsPayload());
  }
};

type EventConstructor<Args extends any[] = any[]> = (...args: Args) => (AnalyticsEvent | void);

const mapEventType = <E extends {track: EventConstructor}>(event: E): E => ({
  ...event,
  track: triggerEvent(event.track),
});

const analytics = {
  clickButton: mapEventType(clickButton),
  clickLink: mapEventType(clickLink),
  createNote: mapEventType(highlightingCreateNote),
  editAnnotation: mapEventType(highlightingEditAnnotation),
  editNoteColor: mapEventType(highlightingEditColor),
  pageFocus: mapEventType(pageFocus),
  print: mapEventType(print),
  search: mapEventType(search),
  unload: mapEventType(unload),
};

export const registerGlobalAnalytics = (window: Window, store: Store) => {
  const document = window.document;

  window.addEventListener('beforeunload', () => {
    analytics.unload.track(analytics.unload.selector(store.getState()));
  });

  const onPageFocusChange = (focus: boolean) => () => {
    analytics.pageFocus.track(analytics.pageFocus.selector(store.getState()), focus);
  };
  window.onblur = onPageFocusChange(false);
  window.onfocus = onPageFocusChange(true);

  document.addEventListener('click', (e) => {
    if (!e.target || !(e.target instanceof window.Node)) {
      return;
    }

    const anchor = findFirstAncestorOrSelfOfType(e.target, window.HTMLAnchorElement);
    if (anchor) {
      analytics.clickLink.track(analytics.clickLink.selector(store.getState()), anchor);
    }

    const button = findFirstAncestorOrSelfOfType(e.target, window.HTMLButtonElement);
    if (button) {
      analytics.clickButton.track(analytics.clickButton.selector(store.getState()), button);
    }
  });

  window.matchMedia('print').addListener((mql) => {
    if (mql.matches) {
      analytics.print.track(analytics.print.selector(store.getState()));
    }
  });
};

export default analytics;
