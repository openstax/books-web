import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import React from 'react';
import * as selectAuth from '../../../auth/selectors';
import { findFirstAncestorOrSelf } from '../../../domUtils';
import { isDefined } from '../../../guards';
import * as selectNavigation from '../../../navigation/selectors';
import { AppServices, AppState, Dispatch } from '../../../types';
import { assertWindow, memoizeStateToProps } from '../../../utils';
import { assertDocument } from '../../../utils/browser-assertions';
import {
  clearFocusedHighlight,
  focusHighlight,
} from '../../highlights/actions';
import CardWrapper from '../../highlights/components/CardWrapper';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import { isHighlightScrollTarget } from '../../highlights/guards';
import * as selectHighlights from '../../highlights/selectors';
import { HighlightData } from '../../highlights/types';
import * as select from '../../selectors';
import attachHighlight from '../utils/attachHighlight';
import { erase, highlightData, insertPendingCardInOrder, isUnknownHighlightData, updateStyle } from './highlightUtils';

export interface HighlightManagerServices {
  getProp: () => HighlightProp;
  setPendingHighlight: (highlight: Highlight) => void;
  clearPendingHighlight: () => void;
  highlighter: Highlighter;
  container: HTMLElement;
}

export const mapStateToHighlightProp = memoizeStateToProps((state: AppState) => ({
  focused: selectHighlights.focused(state),
  hasUnsavedHighlight: selectHighlights.hasUnsavedHighlight(state),
  highlights: selectHighlights.highlights(state),
  highlightsLoaded: selectHighlights.highlightsLoaded(state),
  loggedOut: selectAuth.loggedOut(state),
  page: select.page(state),
  scrollTarget: selectNavigation.scrollTarget(state),
}));
export const mapDispatchToHighlightProp = (dispatch: Dispatch) => ({
  clearFocus: flow(clearFocusedHighlight, dispatch),
  focus: flow(focusHighlight, dispatch),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>
  & ReturnType<typeof mapDispatchToHighlightProp>;

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onFocusHighlight = (
  highlightManagerServices: HighlightManagerServices,
  highlight: Highlight | undefined,
  appServices: AppServices
) => defer(async() => {
  if (!highlight || highlightManagerServices.getProp().focused === highlight.id) {
    return;
  }
  if (highlightManagerServices.getProp().focused
    && highlightManagerServices.getProp().hasUnsavedHighlight
    && !await showConfirmation(appServices)) {
    return;
  }

  highlightManagerServices.getProp().focus(highlight.id);
});

// Without defer when user focus highlight with TAB and then click on the card the activeElement
// will be set to a <body> element for some reason
const onFocusOutHighlight = (props: HighlightProp) => defer(() => {
  // Do not clear focus from highlight if it was moved to the Card component or to another highlight
  // We still want to clear focused highlight if user TAB outside of it, for example to figure link.
  const activeElement = assertDocument().activeElement;
  if (
    activeElement
    && findFirstAncestorOrSelf(
      activeElement,
      (node) => node.hasAttribute('data-highlight-card') || node.hasAttribute('data-for-screenreaders')
    )
  ) {
    return;
  }
  props.clearFocus();
});

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onSelectHighlight = (
  highlightManagerServices: HighlightManagerServices,
  appServices: AppServices,
  highlights: Highlight[],
  highlight: Highlight | undefined
) => defer(async() => {
  if (highlights.length > 0 || !highlight) {
    return;
  }

  if (highlightManagerServices.getProp().hasUnsavedHighlight && !await showConfirmation(appServices)) {
    assertWindow().getSelection()?.removeAllRanges();
    return;
  }

  highlightManagerServices.getProp().focus(highlight.id);
  highlightManagerServices.setPendingHighlight(highlight);
});

const createHighlighter = (
  highlightManagerServices: Omit<HighlightManagerServices, 'highlighter' | 'intl'>,
  appServices: AppServices
) => {

  const highlighter: Highlighter = new Highlighter(highlightManagerServices.container, {
    formatMessage: appServices.intl.formatMessage,
    onClick: (highlight) => onFocusHighlight({ ...highlightManagerServices, highlighter}, highlight, appServices),
    onFocusIn: (highlight) => onFocusHighlight({ ...highlightManagerServices, highlighter}, highlight, appServices),
    onFocusOut: () => onFocusOutHighlight(highlightManagerServices.getProp()),
    onSelect: (...args) => onSelectHighlight({ ...highlightManagerServices, highlighter}, appServices, ...args),
    skipIDsBy: /^(\d+$|term)/,
    snapMathJax: true,
    snapTableRows: true,
    snapWords: true,
  });
  return highlighter;
};

const getHighlightToFocus = (
  focused?: Highlight | null,
  prevFocusedId?: string,
  pendingHighlight?: Highlight,
  scrollTargetHighlight?: Highlight | null,
  scrollTargetHighlightIdThatWasHandled?: string | null
) => {
  if (focused) { return focused; }
  if (
    !pendingHighlight
    && !prevFocusedId
    && scrollTargetHighlight
    && scrollTargetHighlight.id !== scrollTargetHighlightIdThatWasHandled
  ) {
    return scrollTargetHighlight;
  }
  return null;
};

export interface UpdateOptions {
  onSelect: (highlight: Highlight | null) => void;
}

export default (container: HTMLElement, getProp: () => HighlightProp, appServices: AppServices) => {
  let highlighter: Highlighter;
  let pendingHighlight: Highlight | undefined;
  let scrollTargetHighlightIdThatWasHandled: string;
  let setListHighlighter = (_highlighter: Highlighter): void => undefined;
  let setListHighlights = (_highlights: Highlight[]): void => undefined;
  let setListPendingHighlight: ((highlight: Highlight | undefined) => void) | undefined;

  const clearPendingHighlight = () => {
    pendingHighlight = undefined;
    if (setListPendingHighlight) {
      setListPendingHighlight(undefined);
    }
  };

  const setPendingHighlight = (highlight: Highlight) => {
    pendingHighlight = highlight;
    if (setListPendingHighlight) {
      setListPendingHighlight(highlight);
    }
  };

  const focusAndScrollToHighlight = (prevProps: HighlightProp, props: HighlightProp, options?: UpdateOptions) => {
    const { scrollTarget, focus, focused: focusedId, highlightsLoaded, loggedOut, page } = props;
    const focused = focusedId ? highlighter.getHighlight(focusedId) : null;
    const stateEstablished = (highlightsLoaded || (loggedOut && page));

    const highlightScrollTarget = scrollTarget && isHighlightScrollTarget(scrollTarget) ? scrollTarget : null;
    const scrollTargetHighlight = highlightScrollTarget && highlighter.getHighlight(highlightScrollTarget.id);

    const toFocus = getHighlightToFocus(
      focused, prevProps.focused, pendingHighlight, scrollTargetHighlight, scrollTargetHighlightIdThatWasHandled);

    if (toFocus) {
      toFocus.addFocusedStyles();

      if (options) {
        options.onSelect(toFocus);
      }

      if (
        scrollTargetHighlight
        && toFocus.id === scrollTargetHighlight.id
        && toFocus.id !== focusedId
        && toFocus.id !== scrollTargetHighlightIdThatWasHandled) {
        focus(toFocus.id);
        (toFocus.elements[0] as HTMLElement).scrollIntoView();
        scrollTargetHighlightIdThatWasHandled = scrollTargetHighlight.id;
      }
    } else if (options && stateEstablished && highlightScrollTarget && !scrollTargetHighlightIdThatWasHandled) {
      options.onSelect(null);
      scrollTargetHighlightIdThatWasHandled = highlightScrollTarget.id;
    }
  };

  const highlightManagerServices = {
    clearPendingHighlight,
    container,
    getProp,
    setPendingHighlight,
  };

  highlighter = createHighlighter(highlightManagerServices, appServices);
  setListHighlighter(highlighter);

  return {
    CardList: () => {
      const [listHighlighter, setHighlighter] = React.useState<Highlighter | undefined>(highlighter);
      const [listHighlights, setHighlights] = React.useState<Highlight[]>([]);
      const [listPendingHighlight, setInnerPendingHighlight] = React.useState<Highlight | undefined>(pendingHighlight);

      setListHighlighter = setHighlighter;
      setListHighlights = setHighlights;
      setListPendingHighlight = setInnerPendingHighlight;

      return React.createElement(CardWrapper, {
        container,
        highlighter: listHighlighter,
        highlights: listPendingHighlight
          ? insertPendingCardInOrder(highlighter, listHighlights, listPendingHighlight)
          : listHighlights,
      });
    },
    unmount: (): void => highlighter && highlighter.unmount(),
    update: (prevProps: HighlightProp, options?: UpdateOptions) => {
      let addedOrRemoved = false;

      const matchHighlightId = (id: string) => (search: HighlightData | Highlight) => search.id === id;

      if (
        pendingHighlight
        && !highlighter.getHighlight(pendingHighlight.id)
        && getProp().highlights.find(matchHighlightId(pendingHighlight.id))
      ) {
        addedOrRemoved = true;
        attachHighlight(pendingHighlight, highlighter);
      }

      getProp().highlights
        .map(updateStyle(highlighter))
      ;

      const newHighlights = getProp().highlights
        .filter(isUnknownHighlightData(highlighter))
        .map(highlightData({ ...highlightManagerServices, highlighter }))
        .filter(isDefined)
        ;

      const removedHighlights = highlighter.getHighlights()
        .filter((highlight) => !getProp().highlights.find(matchHighlightId(highlight.id)))
        .map(erase(highlighter))
        ;

      highlighter.clearFocusedStyles();

      focusAndScrollToHighlight(prevProps, getProp(), options);

      if (pendingHighlight && removedHighlights.find(matchHighlightId(pendingHighlight.id))) {
        clearPendingHighlight();
      }

      if (addedOrRemoved || newHighlights.length > 0 || removedHighlights.length > 0) {
        setListHighlights(highlighter.getOrderedHighlights());
        return true;
      }

      return addedOrRemoved;
    },
  };
};

export const stubHighlightManager = ({
  CardList: (() => null) as React.FC,
  unmount: (): void => undefined,
  update: (_prevProps: HighlightProp, _options?: UpdateOptions): boolean => false,
});
