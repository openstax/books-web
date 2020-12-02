import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { h4Style } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { setAnswer } from '../actions';
import * as pqSelectors from '../selectors';
import { PracticeAnswer } from '../types';
import Answer from './Answer';
import QuestionNavigation from './QuestionNavigation';

// tslint:disable-next-line: variable-name
const QuestionWrapper = styled.form`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const QuestionContent = styled(ContentExcerpt)`
  ${h4Style}
  font-weight: bold;
  color: ${theme.color.primary.gray.base};
  padding: 0;
`;

// tslint:disable-next-line: variable-name
const AnswersWrapper = styled.div`
  margin-top: ${theme.padding.page.desktop}rem;
`;

const getChoiceLetter = (value: number) => {
  return (value + 10).toString(36);
};

// tslint:disable-next-line: variable-name
const Question = () => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<PracticeAnswer | null>(null);
  const [showCorrect, setShowCorrect] = React.useState(false);
  const question = useSelector(pqSelectors.question);
  const section = useSelector(pqSelectors.selectedSection);
  const isSubmitted = useSelector(pqSelectors.isCurrentQuestionSubmitted);
  const dispatch = useDispatch();

  React.useEffect(() => {
    return () => {
      setSelectedAnswer(null);
      setShowCorrect(false);
    };
  }, [question]);

  if (!section || !question) { return null; }

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
      onShowAnswer={() => setShowCorrect(true)}
      hideShowAnswerButton={showCorrect}
    />
  </QuestionWrapper>;
};

export default Question;
