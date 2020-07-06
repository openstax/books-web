import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import { History } from 'history';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import React from 'react';
import * as selectAuth from '../../../auth/selectors';
import { isDefined } from '../../../guards';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import {
  clearFocusedHighlight,
  focusHighlight,
} from '../../highlights/actions';
import CardWrapper from '../../highlights/components/CardWrapper';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import * as selectHighlights from '../../highlights/selectors';
import { HighlightData, HighlightScrollTarget } from '../../highlights/types';
import * as select from '../../selectors';
import attachHighlight from '../utils/attachHighlight';
import { erase, highlightData, insertPendingCardInOrder, isUnknownHighlightData, updateStyle } from './highlightUtils';

export interface HighlightManagerServices {
  getProp: () => HighlightProp;
  setPendingHighlight: (highlight: Highlight) => void;
  clearPendingHighlight: () => void;
  highlighter: Highlighter;
  container: HTMLElement;
  history: History;
}

export const mapStateToHighlightProp = (state: AppState) => ({
  focused: selectHighlights.focused(state),
  hasUnsavedHighlight: selectHighlights.hasUnsavedHighlight(state),
  highlights: selectHighlights.highlights(state),
  highlightsLoaded: selectHighlights.highlightsLoaded(state),
  loggedOut: selectAuth.loggedOut(state),
  page: select.page(state),
  scrollTarget: selectNavigation.scrollTarget(state),
});
export const mapDispatchToHighlightProp = (dispatch: Dispatch) => ({
  clearFocus: flow(clearFocusedHighlight, dispatch),
  focus: flow(focusHighlight, dispatch),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>
  & ReturnType<typeof mapDispatchToHighlightProp>;

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onClickHighlight = (services: HighlightManagerServices, highlight: Highlight | undefined) => defer(async() => {
  if (!highlight || services.getProp().focused === highlight.id) {
    return;
  }
  if (services.getProp().focused && services.getProp().hasUnsavedHighlight && !await showConfirmation()) {
    return;
  }

  services.getProp().focus(highlight.id);
  if (services.getProp().scrollTarget) {
    services.history.replace({hash: '', search: ''});
  }
});

// deferred so any cards that are going to blur themselves will have done so before this is processed
const onSelectHighlight = (
  services: HighlightManagerServices,
  highlights: Highlight[],
  highlight: Highlight | undefined
) => defer(async() => {
  if (highlights.length > 0 || !highlight) {
    return;
  }

  if (services.getProp().hasUnsavedHighlight && !await showConfirmation()) {
    assertWindow().getSelection().removeAllRanges();
    return;
  }

  services.getProp().focus(highlight.id);
  services.setPendingHighlight(highlight);
});

const createHighlighter = (services: Omit<HighlightManagerServices, 'highlighter'>) => {

  const highlighter: Highlighter = new Highlighter(services.container, {
    onClick: (highlight) => onClickHighlight({ ...services, highlighter }, highlight),
    onSelect: (...args) => onSelectHighlight({ ...services, highlighter }, ...args),
    skipIDsBy: /^(\d+$|term)/,
    snapMathJax: true,
    snapTableRows: true,
    snapWords: true,
  });
  return highlighter;
};

interface UpdateOptions {
  onSelect: (scrollTarget: HighlightScrollTarget | null, highlight: Highlight | null) => void;
}

export default (container: HTMLElement, getProp: () => HighlightProp, history: History) => {
  let highlighter: Highlighter;
  let pendingHighlight: Highlight | undefined;
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

  const services = {
    clearPendingHighlight,
    container,
    getProp,
    history,
    setPendingHighlight,
  };

  highlighter = createHighlighter(services);
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
    update: (options?: UpdateOptions) => {
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
        .map(highlightData({ ...services, highlighter }))
        .filter(isDefined)
        ;

      const removedHighlights = highlighter.getHighlights()
        .filter((highlight) => !getProp().highlights.find(matchHighlightId(highlight.id)))
        .map(erase(highlighter))
        ;

      highlighter.clearFocus();
      const { scrollTarget, focus, focused: focusedId, highlightsLoaded, loggedOut, page } = getProp();
      const highlightScrollTarget = scrollTarget && scrollTarget.type === 'highlight' ? scrollTarget : null;
      const focused = focusedId && highlighter.getHighlight(focusedId);
      const scrollTargetHighlight = highlightScrollTarget && highlighter.getHighlight(highlightScrollTarget.id);
      const toFocus = scrollTargetHighlight || focused;
      if (toFocus) {
        toFocus.focus();
        if (toFocus.id !== focusedId) {
          focus(toFocus.id);
        }
      }
      if (
        options
        && (highlightsLoaded || (loggedOut && page))
      ) {
        options.onSelect(highlightScrollTarget, toFocus || null);
      }

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
  update: (_options?: UpdateOptions): boolean => false,
});
