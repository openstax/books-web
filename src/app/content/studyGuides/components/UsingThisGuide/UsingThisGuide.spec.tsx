
import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../../test/TestContainer';
import UsingThisGuideBanner from './UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuideButton';

describe('Using this guide', () => {
  const onclickFn = jest.fn();

  it('renders using this guide button correctly (when banner closed)', () => {
    const component = renderer.create(<TestContainer>
      <UsingThisGuideButton open={false} onClick={onclickFn}/>
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide button correctly (when banner open)', () => {
    const component = renderer.create(<TestContainer>
      <UsingThisGuideButton open={true} onClick={onclickFn}/>
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide banner correctly', () => {
    const component = renderer.create(<TestContainer>
      <UsingThisGuideBanner show={true} onClick={onclickFn}/>
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
