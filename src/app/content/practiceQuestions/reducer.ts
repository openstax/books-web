import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { receiveFeatureFlags } from '../../actions';
import { locationChange } from '../../navigation/actions';
import { AnyAction } from '../../types';
import { modalQueryParameterName, practiceQuestionsFeatureFlag } from '../constants';
import * as actions from './actions';
import { modalUrlName } from './constants';
import { State } from './types';

export const initialState: State = {
  currentQuestionIndex: null,
  isEnabled: false,
  open: false,
  questions: [],
  questionsAndAnswers: new Map(),
  selectedSection: null,
  summary: null,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(locationChange):
      const shouldBeOpen = action.payload.query[modalQueryParameterName] === modalUrlName
        && action.payload.action === 'PUSH';

      return {...state, open: shouldBeOpen, selectedSection: null, questions: []};
    case getType(receiveFeatureFlags):
      return {...state, isEnabled: action.payload.includes(practiceQuestionsFeatureFlag)};
    case getType(actions.openPracticeQuestions):
      return {...state, open: true};
    case getType(actions.closePracticeQuestions):
      return {...state, open: false, selectedSection: null, questions: [], currentQuestionIndex: null};
    case getType(actions.receivePracticeQuestionsSummary):
      return {...state, summary: action.payload};
    case getType(actions.setSelectedSection):
      return {...state, selectedSection: action.payload, currentQuestionIndex: null, questions: []};
    case getType(actions.nextQuestion):
      return {...state, currentQuestionIndex: state.currentQuestionIndex === null ? 0 : state.currentQuestionIndex + 1};
    case getType(actions.setQuestions):
      return {...state, questions: action.payload};
    case getType(actions.setAnswer):
      const { questionId, answer } = action.payload;
      return {...state, questionsAndAnswers: new Map(state.questionsAndAnswers).set(questionId, answer) };
    default:
      return state;
  }
};

export default reducer;
