import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import TestContainer from '../../../../test/TestContainer';
import { runHooksAsync } from '../../../../test/utils';
import Button from '../../../components/Button';
import { Store } from '../../../types';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import FinalScreen from './FinalScreen';

describe('FinalScreen for practice questions', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('renders properly and dispatches action on click', async() => {
    const mockSection = { title: 'some title' } as LinkedArchiveTreeSection;

    const component = renderer.create(<TestContainer store={store}>
      <FinalScreen nextSection={mockSection} />
    </TestContainer>);

    await runHooksAsync(renderer);

    const button = component.root.findByType(Button);

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(mockSection));
    expect(component.toJSON()).toMatchSnapshot();
  });
});
