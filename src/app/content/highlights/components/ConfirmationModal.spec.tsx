import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../test/TestContainer';
import Confirmation from './ConfirmationModal';

describe('ConfirmationModal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <Confirmation
        confirm={() => null}
        deny={() => null}
      />
    </TestContainer>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
