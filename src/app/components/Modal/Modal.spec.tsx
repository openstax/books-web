import React from 'react';
import renderer from 'react-test-renderer';
import Modal from '.';
import TestContainer from '../../../test/TestContainer';

describe('Modal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const component = renderer.create(<TestContainer>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      >
        <div>child 1</div>
        <div>child 2</div>
      </Modal>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
