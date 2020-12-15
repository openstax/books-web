import flow from 'lodash/fp/flow';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { ActionType } from 'typesafe-actions';
import { openMyHighlights } from '../content/highlights/actions';
import { openStudyGuides } from '../content/studyGuides/actions';
import { locationChange } from '../navigation/actions';
import { matchForRoute } from '../navigation/utils';
import { AnyAction } from '../types';
import * as actions from './actions';
import highlightReducer, {initialState as initialHighlightState } from './highlights/reducer';
import practiceQuestionsReducer, {initialState as initialPracticeQuestionsState } from './practiceQuestions/reducer';
import { content } from './routes';
import searchReducer, {initialState as initialSearchState } from './search/reducer';
import studyGuidesReducer, {initialState as initialStudyGuidesState } from './studyGuides/reducer';
import { State } from './types';

export const initialState = {
  buyPrint: null,
  highlights: initialHighlightState,
  loading: {},
  pageNotFoundId: null,
  params: null,
  practiceQuestions: initialPracticeQuestionsState,
  references: [],
  search: initialSearchState,
  showNudgeStudyTools: null,
  studyGuides: initialStudyGuidesState,
  tocOpen: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  return flow(
    (contentState) => {
      const search = searchReducer(contentState.search, action);
      if (contentState.search !== search) {
        return {...contentState, search};
      }
      return contentState;
    },
    (contentState) => {
      const highlights = highlightReducer(contentState.highlights, action);
      if (contentState.highlights !== highlights) {
        return {...contentState, highlights};
      }
      return contentState;
    },
    (contentState) => {
      const practiceQuestions = practiceQuestionsReducer(contentState.practiceQuestions, action);
      if (contentState.practiceQuestions !== practiceQuestions) {
        return {...contentState, practiceQuestions};
      }
      return contentState;
    },
    (contentState) => {
      const studyGuides = studyGuidesReducer(contentState.studyGuides, action);
      if (contentState.studyGuides !== studyGuides) {
        return {...contentState, studyGuides};
      }
      return contentState;
    }
  )(reduceContent(state, action));
};

export default reducer;

function reduceContent(state: State, action: AnyAction) {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(actions.resetToc):
      return {...state, tocOpen: null};
    case getType(actions.requestBook):
      return {...state, loading: {...state.loading, book: action.payload}};
    case getType(actions.receiveBook): {
      return reduceReceiveBook(state, action);
    }
    case getType(actions.requestPage):
      return {...state, loading: {...state.loading, page: action.payload}};
    case getType(actions.receivePage): {
      return reduceReceivePage(state, action);
    }
    case getType(actions.receivePageNotFoundId): {
      const loading = omit('page', state.loading);
      return {...omit(['page', 'references'], state), loading, pageNotFoundId: action.payload};
    }
    case getType(actions.receiveBuyPrintConfig): {
      return {...state, buyPrint: action.payload};
    }
    case getType(locationChange): {
      if (!matchForRoute(content, action.payload.match)) {
        return initialState;
      }

      // book is different
      if (!state.params || !isEqual(action.payload.match.params.book, state.params.book)) {
        return {
          ...initialState,
          highlights: state.highlights,
          loading: state.loading,
          params: action.payload.match.params,
        };
      }

      // book is the same, page is different
      if (state.book && state.page && !isEqual(action.payload.match.params.page, state.params.page)) {
        return {...omit(['page'], state), params: action.payload.match.params};
      }

      // book and page are the same, probably on page navigation like hash changing
      return {...state, params: action.payload.match.params};
    }
    case getType(actions.openNudgeStudyTools): {
      return {...state, showNudgeStudyTools: true };
    }
    case getType(openMyHighlights):
    case getType(openStudyGuides):
    case getType(actions.closeNudgeStudyTools): {
      return {...state, showNudgeStudyTools: false };
    }
    default:
      return state;
  }
}

function reduceReceiveBook(state: State, action: ActionType<typeof actions.receiveBook>) {
  const loading = omit(['book'], state.loading);
  const book = pick([
    'id',
    'title',
    'version',
    'tree',
    'theme',
    'slug',
    'license',
    'authors',
    'publish_date',
    'revised',
    'amazon_link',
    'book_state',
  ], action.payload);
  return {...state, loading, book};
}

function reduceReceivePage(state: State, action: ActionType<typeof actions.receivePage>) {
  const loading = omit('page', state.loading);
  const page = pick(['abstract', 'id', 'title', 'version'], action.payload);
  return {...state, loading, page, references: action.payload.references};
}
