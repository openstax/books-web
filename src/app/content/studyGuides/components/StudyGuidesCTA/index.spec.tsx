import React from 'react';
import renderer from 'react-test-renderer';
import StudyGuidesCTA from '.';
import createTestStore from '../../../../../test/createTestStore';
import TestContainer from '../../../../../test/TestContainer';
import { receiveLoggedOut, receiveUser } from '../../../../auth/actions';
import { Store } from '../../../../types';
import * as Styled from './styles';

describe('StudyGuidesCTA', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('does not render if user is logged in', () => {
    store.dispatch(receiveUser({} as any));

    const component = renderer.create(<TestContainer store={store}>
      <StudyGuidesCTA />
    </TestContainer>);

    expect(() => component.root.findByType(Styled.StudyGuidesCTAWrapper)).toThrow();
  });

  it('does render if user is not logged in', () => {
    store.dispatch(receiveLoggedOut());

    const component = renderer.create(<TestContainer store={store}>
      <StudyGuidesCTA />
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
