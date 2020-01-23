import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { makeFindByTestId, renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import { assertWindow } from '../../../utils';
import { highlightStyles } from '../constants';
import Confirmation from './Confirmation';
import DisplayNote from './DisplayNote';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./TruncatedText', () => (props: any) => <div mock-truncated-text {...props} />);

describe('DisplayNote', () => {

  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={false} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={true} />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows delete confirmation', () => {
    const onRemove = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={true} onRemove={onRemove} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    expect(() => component.root.findByType(Confirmation)).not.toThrow();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('confirmation deletes', () => {
    const onRemove = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={true} onRemove={onRemove} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    renderer.act(() => {
      confirmation.props.onConfirm();
    });

    expect(onRemove).toHaveBeenCalled();
  });

  it('confirmation cancels', () => {
    const onRemove = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={true} onRemove={onRemove} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    renderer.act(() => {
      confirmation.props.onCancel();
    });

    expect(() => component.root.findByType(Confirmation)).toThrow();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('closes confirmation on click outside', () => {
    let isFocused = true;
    const onRemove = jest.fn();
    const component = renderer.create(<MessageProvider onError={() => null}>
      <DisplayNote style={highlightStyles[0]} isFocused={isFocused} onRemove={onRemove} />
    </MessageProvider>);
    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    expect(confirmation).toBeDefined();

    const displayNote = component.root.findByType(DisplayNote);
    renderer.act(() => {
      isFocused = false;
      // displayNote.props.isFocused = false;
    });

    renderer.act(() => {
      const confirmation = component.root.findByType(Confirmation);
      expect(confirmation).not.toBeDefined();
    });

    // expect(confirmation).not.toBeDefined();

  });
});
