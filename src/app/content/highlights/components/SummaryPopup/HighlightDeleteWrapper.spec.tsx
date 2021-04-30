import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../../../../test/TestContainer';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';

describe('HighlightDeleteWrapper', () => {
  it('match snapshot', () => {
    const component = renderer.create(<TestContainer>
      {/* tslint:disable-next-line: no-empty */}
      <HighlightDeleteWrapper onCancel={() => {}} onDelete={() => {}} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onDelete props', () => {
    let deleteClicked = false;
    let cancelClicked = false;

    const component = renderer.create(<TestContainer>
      <HighlightDeleteWrapper
        onCancel={() => { cancelClicked = true; }}
        onDelete={() => { deleteClicked = true; }}
      />
    </TestContainer>);

    renderer.act(() => {
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
      const cancelButton = component.root.findByProps({ 'data-testid': 'cancel' });
      cancelButton.props.onClick();
    });

    expect(deleteClicked).toEqual(true);
    expect(cancelClicked).toEqual(true);
  });

  it('focus wrapper on render', async() => {
    const focus = jest.fn();
    const createNodeMock = () => ({ focus });

    renderer.create(<TestContainer>
      <HighlightDeleteWrapper
        onCancel={() => null}
        onDelete={() => null}
      />
    </TestContainer>, {createNodeMock});

    // Wait for React.useEffect()
    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    expect(focus).toHaveBeenCalled();
  });
});
