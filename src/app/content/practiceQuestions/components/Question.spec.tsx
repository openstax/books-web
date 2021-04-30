import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as mathjaxHelpers from '../../../../helpers/mathjax';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book } from '../../../../test/mocks/archiveLoader';
import TestContainer from '../../../../test/TestContainer';
import Button from '../../../components/Button';
import { Store } from '../../../types';
import { assertDefined } from '../../../utils';
import { assertDocument, assertWindow } from '../../../utils/browser-assertions';
import { receiveBook } from '../../actions';
import { LinkedArchiveTreeSection } from '../../types';
import { findArchiveTreeNodeById } from '../../utils/archiveTreeUtils';
import * as bookPageUtils from '../../utils/urlUtils';
import { finishQuestions, nextQuestion, setAnswer, setQuestions, setSelectedSection } from '../actions';
import { PracticeQuestion } from '../types';
import Answer from './Answer';
import Question, { AnswersWrapper, QuestionContent, QuestionWrapper } from './Question';

describe('Question', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;
  let linkedArchiveTreeSection: LinkedArchiveTreeSection;
  let dispatch: jest.SpyInstance;
  const mockQuestion = {
    answers: [
      {
        content_html: '<span data-math=\'25\'>25</span>',
        correctness: '0.0',
        feedback_html: '...',
        id: 273729,
      },
      {
        content_html: '<span data-math=\'26\'>26</span>',
        correctness: '1.0',
        feedback_html: 'Iron is most strongly bound nuclide.',
        id: 273730,
      },
    ],
    group_uuid: 'd95384f2-1330-4582-9d81-1af0eae17b48',
    stem_html: 'What is the atomic number of the most strongly bound nuclide?',
    tags: 'd95384f2-1330-4582-9d81-1af0eae17b48',
    uid: '11591@5',
  } as PracticeQuestion;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
    services = createTestServices();
    dispatch = jest.spyOn(store, 'dispatch');
    store.dispatch(receiveBook(book));
    jest.spyOn(bookPageUtils, 'getBookPageUrlAndParams')
      .mockReturnValue({ url: 'asdf' } as any);
    render = () => <TestContainer services={services} store={store}>
          <Question />
    </TestContainer>;
    linkedArchiveTreeSection = assertDefined(
      findArchiveTreeNodeById(book.tree, 'testbook1-testpage2-uuid'),
      'mock file has been changed'
    ) as LinkedArchiveTreeSection;
  });

  it('renders null if there is no current question', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null if there is no selected section question', () => {
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    const component = renderer.create(render());

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders all components', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const mockQuestionContainer = assertDocument().createElement('div');
    const spyQuestionContainerFocus = jest.spyOn(mockQuestionContainer, 'focus');

    const component = renderer.create(render(), { createNodeMock: () => mockQuestionContainer });

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    renderer.act(() => {});

    expect(() => component.root.findByType(QuestionWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionContent)).not.toThrow();
    expect(() => component.root.findByType(AnswersWrapper)).not.toThrow();
    expect(component.root.findAllByType(Answer).length).toEqual(mockQuestion.answers.length);
    expect(spyQuestionContainerFocus).toHaveBeenCalled();
  });

  it('renders properly with selected and submitted answer', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    expect(() => component.root.findByType(QuestionWrapper)).not.toThrow();
    expect(() => component.root.findByType(QuestionContent)).not.toThrow();
    expect(() => component.root.findByType(AnswersWrapper)).not.toThrow();

    const answers = component.root.findAllByType(Answer);
    const [fristAnswer, secondAnswer] = answers;
    expect(answers.length).toEqual(mockQuestion.answers.length);
    expect(fristAnswer.props.isSelected).toEqual(false);
    expect(secondAnswer.props.isSelected).toEqual(false);

    const input = secondAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    expect(fristAnswer.props.isSelected).toEqual(false);
    expect(secondAnswer.props.isSelected).toEqual(true);

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(fristAnswer.props.isSubmitted).toEqual(true);
    expect(secondAnswer.props.isSubmitted).toEqual(true);
  });

  it('submit is active after selecting an answer', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const submit = component.root.findByProps({ 'data-analytics-label': 'Submit' });
    expect(submit.props.disabled).toEqual(true);

    const [firstAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    expect(submit.props.disabled).toEqual(false);
  });

  it('clicking skip works', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion, { ...mockQuestion, uid: '213' }]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const [skip] = component.root.findAllByType(Button);

    act(() => {
      skip.props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).toHaveBeenCalledWith(setAnswer({ questionId: mockQuestion.uid, answer: null }));
    expect(dispatch).toHaveBeenCalledWith(nextQuestion());

    act(() => {
      skip.props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).toHaveBeenCalledWith(finishQuestions());
  });

  it('after submitting incorrect answer there is Show answer button that works', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const submit = component.root.findByProps({ 'data-analytics-label': 'Submit' });
    expect(submit.props.disabled).toEqual(true);

    const [firstAnswer, secondAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(setAnswer({ questionId: mockQuestion.uid, answer: mockQuestion.answers[0] }));
    expect(() => firstAnswer.findByProps({ id: 'i18n:practice-questions:popup:incorrect' })).not.toThrow();
    expect(() => secondAnswer.findByProps({ id: 'i18n:practice-questions:popup:correct' })).toThrow();

    const [showAnswer] = component.root.findAllByType(Button);

    act(() => {
      showAnswer.props.onClick({ preventDefault: jest.fn() });
    });

    expect(() => secondAnswer.findByProps({ id: 'i18n:practice-questions:popup:correct' })).not.toThrow();
    expect(() => component.root.findByProps({ value: 'Show answer' })).toThrow();
  });

  it('handles clicking on Next button when submitted answer was incorrect and focuses Show Answer', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion, {...mockQuestion, uid: '213'}]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const mockShowAnswerButton = assertDocument().createElement('button');
    const spyShowAnswerFocus = jest.spyOn(mockShowAnswerButton, 'focus');

    const component = renderer.create(render(), { createNodeMock: (el: any) => {
      if (el.props['data-testid'] === 'show-answer') { return mockShowAnswerButton; }
      return undefined;
    } });

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const [firstAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(() => component.root.findByProps({
      id: 'i18n:practice-questions:popup:navigation:show-answer:after-submit-incorrect:aria-label',
    })).not.toThrow();

    const next = component.root.findByProps({ 'data-testid': 'next' })!;
    act(() => {
      next.props.onClick({ preventDefault: jest.fn() });
    });

    expect(dispatch).toHaveBeenCalledWith(nextQuestion());
    expect(spyShowAnswerFocus).toHaveBeenCalled();
  });

  it('after submitting correct answer the Next button is focused and proper aria label is set', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion, {...mockQuestion, uid: '213'}]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const mockNextButton = assertDocument().createElement('button');
    const spyNextFocus = jest.spyOn(mockNextButton, 'focus');

    const component = renderer.create(render(), { createNodeMock: (el: any) => {
      if (el.props['data-testid'] === 'next-is-correct') { return mockNextButton; }
      return undefined;
    } });

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const [, correctAnswer] = component.root.findAllByType(Answer);
    const input = correctAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(() => component.root.findByProps({ 'data-testid': 'next-is-correct' })).not.toThrow();
    expect(spyNextFocus).toHaveBeenCalled();
  });

  it('clicking on submitted answer does nothing', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => {});

    const [, secondAnswer] = component.root.findAllByType(Answer);
    const input = secondAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });
    expect(input.props.checked).toEqual(true);

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    act(() => {
      input.props.onChange();
    });

    expect(input.props.checked).toEqual(true);
  });

  it('adds typesetMath promise to the promiseCollector', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());

    const spyPromiseCollectorAdd = jest.spyOn(services.promiseCollector, 'add');

    const container = assertDocument().createElement('div');
    renderer.create(render(), { createNodeMock: () => container });

    expect(spyPromiseCollectorAdd).toHaveBeenCalledWith(mathjaxHelpers.typesetMath(container, assertWindow()));
  });

  it('submits the form by pressing Submit and Finish buttons', () => {
    store.dispatch(setSelectedSection(linkedArchiveTreeSection));
    store.dispatch(setQuestions([mockQuestion]));
    store.dispatch(nextQuestion());
    dispatch.mockClear();

    const component = renderer.create(render());

    // Run initial useEffect hook
    // tslint:disable-next-line: no-empty
    act(() => { });

    const [firstAnswer] = component.root.findAllByType(Answer);
    const input = firstAnswer.findByProps({ type: 'radio' });

    act(() => {
      input.props.onChange();
    });

    const form = component.root.findByProps({ 'data-testid': 'question-form' });
    const preventDefault = jest.fn();
    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(dispatch).toHaveBeenCalledWith(setAnswer({ questionId: mockQuestion.uid, answer: mockQuestion.answers[0] }));

    act(() => {
      form.props.onSubmit({ preventDefault });
    });

    expect(dispatch).toHaveBeenCalledWith(finishQuestions());
  });
});
