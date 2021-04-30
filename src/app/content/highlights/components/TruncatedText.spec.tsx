import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../test/TestContainer';
import TruncatedText from './TruncatedText';

describe('TruncatedText', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <TruncatedText text='asdf' isActive={false} onChange={() => null} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<TestContainer>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows link', async() => {
    const createNodeMock = () => ({
      offsetHeight: 50,
      scrollHeight: 100,
    });

    const component = renderer.create(<TestContainer>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>, {createNodeMock});

    component.update(<TestContainer>
      <TruncatedText text='asdf' isActive={true} onChange={() => null} />
    </TestContainer>);

    expect(() => component.root.findByType('span')).not.toThrow();
  });

  it('calls onChange when state changes', () => {
    const onChange = jest.fn();

    renderer.create(<TestContainer>
      <TruncatedText text='asdf' isActive={false} onChange={onChange} />
    </TestContainer>);

    renderer.create(<TestContainer>
      <TruncatedText text='asdf' isActive={true} onChange={onChange} />
    </TestContainer>);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
