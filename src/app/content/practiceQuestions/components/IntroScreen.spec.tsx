import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import TestContainer from '../../../../test/TestContainer';
import Button from '../../../components/Button';
import { Store } from '../../../types';
import { nextQuestion, setQuestions } from '../actions';
import { PracticeQuestions } from '../types';
import IntroScreen from './IntroScreen';

describe('IntroScreen for practice questions', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let render: () => JSX.Element;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    render = () => <TestContainer store={store}>
      <IntroScreen />
    </TestContainer>;
  });

  it('renders properly for 1 question', () => {
    store.dispatch(setQuestions([{}, {}] as PracticeQuestions));
    const component = renderer.create(render());
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders properly for 2 questions', () => {
    store.dispatch(setQuestions([{}, {}] as PracticeQuestions));
    const component = renderer.create(render());
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('dispatch action onClick', () => {
    const component = renderer.create(render());

    const button = component.root.findByType(Button);

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(nextQuestion());
  });
});
