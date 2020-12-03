import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { h4Style } from '../../../components/Typography';
import { match } from '../../../fpUtils';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { setAnswer } from '../actions';
import * as pqSelectors from '../selectors';
import { PracticeAnswer, PracticeQuestion } from '../types';
import Answer from './Answer';
import QuestionNavigation from './QuestionNavigation';

// tslint:disable-next-line: variable-name
export const QuestionWrapper = styled.form`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const QuestionContent = styled(ContentExcerpt)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  padding: 0;
`;

// tslint:disable-next-line: variable-name
export const AnswersWrapper = styled.div`
  margin-top: ${theme.padding.page.desktop}rem;
`;

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

// tslint:disable-next-line: variable-name
const Question = () => {
  const [selectedAnswerState, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);
  const [showCorrectState, setShowCorrect] = React.useState<PracticeQuestion | null>(null);

  const question = useSelector(pqSelectors.question);
  const section = useSelector(pqSelectors.selectedSection);
  const isSubmitted = useSelector(pqSelectors.isCurrentQuestionSubmitted);
  const dispatch = useDispatch();

  if (!section || !question) { return null; }

  const selectedAnswer = question.answers.find(match(selectedAnswerState)) || null;
  const showCorrect = showCorrectState === question;

  const onSubmit = (e: React.FormEvent) => {
    // TODO: Add support for handling Finish button
    e.preventDefault();
    dispatch(setAnswer({ answer: selectedAnswer, questionId: question.uid }));
  };

  return <QuestionWrapper onSubmit={onSubmit} data-testid='question-form'>
    <QuestionContent tabIndex={0} content={question.stem_html} source={section} />
    <AnswersWrapper>
      {question.answers.map((answer, index) =>
        <Answer
          key={index}
          answer={answer}
          choiceIndicator={getChoiceLetter(index)}
          source={section}
          isSubmitted={isSubmitted}
          showCorrect={showCorrect}
          isSelected={Boolean(selectedAnswer && selectedAnswer.id === answer.id)}
          onSelect={() => isSubmitted ? null : setSelectedAnswer(answer)}
        />
      )}
    </AnswersWrapper>
    <QuestionNavigation
      question={question}
      selectedAnswer={selectedAnswer}
      onShowAnswer={() => setShowCorrect(question)}
      hideShowAnswerButton={showCorrect}
    />
  </QuestionWrapper>;
};

export default Question;
