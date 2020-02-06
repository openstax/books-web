import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { servicesContext } from '../app/context/Services';
import { findFirstAncestorOrSelfOfType } from '../app/domUtils';
import { AppState, Store } from '../app/types';
import googleAnalyticsClient from '../gateways/googleAnalyticsClient';
import * as clickButton from './analyticsEvents/clickButton';
import * as clickLink from './analyticsEvents/clickLink';
import { AnalyticsEvent } from './analyticsEvents/event';
import * as highlightingCreateNote from './analyticsEvents/highlighting/createNote';
import * as deleteHighlight from './analyticsEvents/highlighting/delete';
import * as highlightingEditColor from './analyticsEvents/highlighting/editColor';
import * as highlightingEditAnnotation from './analyticsEvents/highlighting/editNote';
import * as pageFocus from './analyticsEvents/pageFocus';
import * as print from './analyticsEvents/print';
import * as search from './analyticsEvents/search';
import * as signupCTA from './analyticsEvents/signupCTA';
import * as unload from './analyticsEvents/unload';

type EventConstructor<Args extends any[] = any[]> = (...args: Args) => (AnalyticsEvent | void);
type Selector = (state: AppState) => object;
interface Event {track: EventConstructor; selector: Selector; }

const triggerEvent = <E extends Event>(event: E): E['track'] => (...args) => {
  const analyticsEvent = event.track(...args);

  if (analyticsEvent) {
    googleAnalyticsClient.trackEventPayload(analyticsEvent.getGoogleAnalyticsPayload());
  }
};

const bindTrackSelector = <E extends Event>(event: E) => (state: AppState) =>  {
  type RemainingArgumentTypes = E['track'] extends (d: ReturnType<E['selector']>, ...args: infer A) => any ? A : never;

  return (...args: RemainingArgumentTypes) => {
    const data = event.selector(state);
    triggerEvent(event)(data, ...args);
  };
};

const mapEventType = <E extends Event>(event: E) => ({
  ...event,
  bind: bindTrackSelector(event),
  track: triggerEvent(event),
});

const analytics = {
  clickButton: mapEventType(clickButton),
  clickLink: mapEventType(clickLink),
  createNote: mapEventType(highlightingCreateNote),
  deleteHighlight: mapEventType(deleteHighlight),
  editAnnotation: mapEventType(highlightingEditAnnotation),
  editNoteColor: mapEventType(highlightingEditColor),
  pageFocus: mapEventType(pageFocus),
  print: mapEventType(print),
  search: mapEventType(search),
  signupCTA: mapEventType(signupCTA),
  unload: mapEventType(unload),
};

export const registerGlobalAnalytics = (window: Window, store: Store) => {
  const document = window.document;

  window.addEventListener('beforeunload', () => {
    analytics.unload.track(analytics.unload.selector(store.getState()));
  });

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

export const useAnalyticsEvent = <T extends keyof typeof analytics>(eventType: T) => {
  // the types in here are horrible, probably because of:
  // https://github.com/Microsoft/TypeScript/issues/13995
  // but the returned function has the correct args so whatever
  const services = useContext(servicesContext);
  const event = services.analytics[eventType];
  const data = useSelector(event.selector as any);

  type E = typeof services['analytics'][T];
  type RemainingArgumentTypes = E['track'] extends (d: ReturnType<E['selector']>, ...args: infer A) => any ? A : never;

  return (...args: RemainingArgumentTypes) => {
    (event.track as any)(data, ...args);
  };
};

export default analytics;
