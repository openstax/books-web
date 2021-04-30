import React from 'react';
import renderer, { act } from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../test/TestContainer';
import { locationChange } from '../../../navigation/actions';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { assertWindow } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { content } from '../../routes';
import LoaderWrapper from '../../styles/LoaderWrapper';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import { finishQuestions, nextQuestion, receivePracticeQuestionsSummary,
  setAnswer, setQuestions, setSelectedSection } from '../actions';
import { PracticeAnswer, PracticeQuestion } from '../types';
import EmptyScreen from './EmptyScreen';
import Filters from './Filters';
import FinalScreen from './FinalScreen';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import Question from './Question';
import ShowPracticeQuestions, {
  QuestionsHeader,
  QuestionsWrapper,
  SectionTitle,
} from './ShowPracticeQuestions';

jest.mock('./IntroScreen', () => (props: any) => <div data-mock-intro-section {...props} />);
jest.mock('./Question', () => (props: any) => <div data-mock-quesiton {...props} />);
jest.mock('./FinalScreen', () => (props: any) => <div data-mock-final-section {...props} />);

describe('ShowPracticeQuestions', () => {
  let store: Store;
  let render: () => JSX.Element;
  let linkedArchiveTreeSection: LinkedArchiveTreeSection;
  let linkedArchiveTreeSection2: LinkedArchiveTreeSection;

  beforeEach(() => {
    store = createTestStore();
    render = () => <TestContainer store={store}>
      <ShowPracticeQuestions />
    </TestContainer>;
    linkedArchiveTreeSection = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
    linkedArchiveTreeSection2 = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage11-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
    jest.spyOn(content, 'getUrl')
      .mockReturnValue('mockedUrl');
  });

  it('renders loader after locationChange until the questions are loaded', () => {
    store.dispatch(locationChange({
      action: 'PUSH',
      location: {
        ...assertWindow().location,
        pathname: '/books/book-slug-1/pages/doesnotmatter',
        state: {},
      },
      match: {
        params: {
          book: { slug: 'book' },
          page: { slug: 'page' },
        },
        route: content,
        state: {},
      },
    }));

    const component = renderer.create(render());

    expect(() => component.root.findByType(LoaderWrapper)).not.toThrow();

    act(() => {
      store.dispatch(receiveBook(book));
      store.dispatch(setSelectedSection(linkedArchiveTreeSection));
      store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));
    });

    expect(() => component.root.findByType(LoaderWrapper)).toThrow();
  });

  it('renders loader after setSelectedSection until the questions are loaded', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));

    const component = renderer.create(render());

    expect(() => component.root.findByType(LoaderWrapper)).not.toThrow();

    act(() => {
      store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));
    });

    expect(() => component.root.findByType(LoaderWrapper)).toThrow();
  });

  it('renders Intro screen', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [linkedArchiveTreeSection.id]: 3 },
    }));
    store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(IntroScreen)).not.toThrow();

    expect(() => component.root.findByType(Filters)).not.toThrow();
    expect(() => component.root.findByType(SectionTitle)).not.toThrow();
    expect(() => component.root.findByType(QuestionsWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionsHeader)).not.toThrow();
    expect(() => component.root.findByProps({ target: '_blank' })).not.toThrow();
    expect(() => component.root.findByType(ProgressBar)).not.toThrow();
  });

  it('renders EmptyScreen if there is nextSection after selected section', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: {
        [linkedArchiveTreeSection.id]: 3,
        [linkedArchiveTreeSection2.id]: 2,
      },
    }));
    store.dispatch(setQuestions([]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(EmptyScreen)).not.toThrow();
    expect(() => component.root.findByType(IntroScreen)).toThrow();
  });

  it('renders EmptyScreen if there is nextSection after current page', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage(linkedArchiveTreeSection as any));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: {
        [linkedArchiveTreeSection.id]: 3,
        [linkedArchiveTreeSection2.id]: 2,
      },
    }));
    store.dispatch(setQuestions([]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(EmptyScreen)).not.toThrow();
    expect(() => component.root.findByType(IntroScreen)).toThrow();
  });

  it('renders Practice Question screen after intro screen', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [linkedArchiveTreeSection.id]: 3 },
    }));
    store.dispatch(setQuestions([{id: 'asd'} as any as PracticeQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    expect(() => component.root.findByType(IntroScreen)).toThrow();

    act(() => {
      store.dispatch(nextQuestion());
    });

    expect(() => component.root.findByType(Question)).not.toThrow();
  });

  it('renders FinalScreen screen at the end of section questions', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(receivePracticeQuestionsSummary({
      countsPerSource: { [linkedArchiveTreeSection.id]: 3 },
    }));

    store.dispatch(setQuestions([{ id: 'asd' } as any as PracticeQuestion]));
    store.dispatch(setAnswer({ questionId: 'asd', answer: { id: 'qwe' } as any as PracticeAnswer }));
    store.dispatch(finishQuestions());

    const component = renderer.create(render());

    expect(() => component.root.findByType(Question)).toThrow();
    expect(() => component.root.findByType(FinalScreen)).not.toThrow();
  });

  it('renders FinalScreen screen if section has no questions and there is no nextSection', () => {
    store.dispatch(receiveBook(book));
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([]));

    const component = renderer.create(render());

    expect(() => component.root.findByType(FinalScreen)).not.toThrow();
  });
});
