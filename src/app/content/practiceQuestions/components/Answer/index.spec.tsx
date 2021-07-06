import React from 'react';
import renderer from 'react-test-renderer';
import Answer from '.';
import TestContainer from '../../../../../test/TestContainer';
import { runHooks } from '../../../../../test/utils';
import { assertDocument } from '../../../../utils/browser-assertions';
import { PracticeQuestion } from '../../types';

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

describe('Answer', () => {
  it('focus answer if it is correct and showCorrect prop is true', () => {
    const container = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(container, 'focus');

    renderer.create(<TestContainer>
      <Answer
        question={mockQuestion}
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '1.0' } as any}
        choiceIndicator={'a'}
        onSelect={jest.fn()}
        source={{} as any}
      />
    </TestContainer>, { createNodeMock: () => container });

    runHooks(renderer);

    expect(spyFocus).toHaveBeenCalled();
  });

  it('does not focus answer if it isn\'t correct but showCorrect prop is true', () => {
    const container = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(container, 'focus');

    renderer.create(<TestContainer>
      <Answer
        question={mockQuestion}
        isSelected={false}
        isSubmitted={false}
        showCorrect={true}
        answer={{ correctness: '0.0' } as any}
        choiceIndicator={'a'}
        onSelect={jest.fn()}
        source={{} as any}
      />
    </TestContainer>, { createNodeMock: () => container });

    runHooks(renderer);

    expect(spyFocus).not.toHaveBeenCalled();
  });
});
