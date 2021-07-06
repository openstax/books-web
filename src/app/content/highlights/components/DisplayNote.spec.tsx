import { Highlight } from '@openstax/highlighter';
import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { makeFindByTestId } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { runHooks } from '../../../../test/utils';
import { DropdownToggle } from '../../../components/Dropdown';
import { Store } from '../../../types';
import { assertDocument, assertWindow } from '../../../utils';
import { openToc } from '../../actions';
import { highlightStyles } from '../../constants';
import { requestSearch } from '../../search/actions';
import Confirmation from './Confirmation';
import DisplayNote, { DisplayNoteProps } from './DisplayNote';
import TruncatedText from './TruncatedText';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./TruncatedText', () => (props: any) => <div mock-truncated-text {...props} />);
jest.useFakeTimers();
const doNothing = () => null;

describe('DisplayNote', () => {
  let displayNoteProps: Partial<DisplayNoteProps>;
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    displayNoteProps = {
      focus: jest.fn(),
      highlight: { elements: [] } as any as Highlight,
      onBlur: jest.fn(),
      onEdit: doNothing,
      onHeightChange: jest.fn(),
      onRemove: jest.fn(),
      style: highlightStyles[0],
    };
  });

  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={false} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={true} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when focused with opened dropdown', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={true} />
    </TestContainer>);

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows delete confirmation', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={true} />
    </TestContainer>);

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    expect(() => component.root.findByType(Confirmation)).not.toThrow();
    expect(displayNoteProps.onRemove).not.toHaveBeenCalled();
  });

  it('confirmation deletes', () => {
    const component = renderer.create(<TestContainer store={store}>
          <DisplayNote {...displayNoteProps} isActive={true} />
    </TestContainer>, { createNodeMock: () => assertDocument().createElement('div')});

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

    const findByTestId = makeFindByTestId(component.root);

    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    const confirmation = component.root.findByType(Confirmation);
    renderer.act(() => {
      confirmation.props.onConfirm();
    });

    expect(displayNoteProps.onRemove).toHaveBeenCalled();
  });

  it('confirmation cancels and does not call props.onBlur', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={true} />
    </TestContainer>);

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

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
    expect(displayNoteProps.onRemove).not.toHaveBeenCalled();
    expect(displayNoteProps.onBlur).not.toHaveBeenCalled();
  });

  it('closes confirmation after changing focus and reopen', () => {
    let isActive = true;

    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={isActive} />
    </TestContainer>);

    expect(() => component.root.findByType(Confirmation)).toThrow();

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

    const findByTestId = makeFindByTestId(component.root);
    const deleteButton = findByTestId('delete');
    renderer.act(() => {
      deleteButton.props.onClick();
    });

    expect(component.root.findByType(Confirmation)).toBeDefined();

    isActive = false;

    component.update(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={isActive} />
    </TestContainer>);

    runHooks(renderer);

    expect(() => component.root.findByType(Confirmation)).toThrow();

    isActive = true;

    component.update(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={isActive} />
    </TestContainer>);

    runHooks(renderer);

    expect(() => component.root.findByType(Confirmation)).toThrow();
  });

  it('calls onHeightChange when textToggle state changes', () => {
    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} isActive={false} />
    </TestContainer>);

    const trucatedText = component.root.findByType(TruncatedText);

    renderer.act(() => {
      trucatedText.props.onChange();
    });

    expect(displayNoteProps.onHeightChange).toHaveBeenCalled();
  });

  it('focuses after click on DropdownToggle', () => {
    const highlight = {
      elements: [],
      id: 'asdf',
    } as any as Highlight;

    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} highlight={highlight} isActive={false} />
    </TestContainer>);

    renderer.act(() => {
      const dropdownToggle = component.root.findByType(DropdownToggle);
      dropdownToggle.props.onClick();
    });

    expect(displayNoteProps.focus).toHaveBeenCalledWith(highlight.id);
  });

  it('calls onHeightChange on open toc, search sidebar or window resize', () => {
    const highlight = { id: 'asdf', elements: [] } as any as Highlight;

    renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} highlight={highlight} isActive={false} />
    </TestContainer>);

    renderer.act(() => {
      store.dispatch(openToc());
    });

    renderer.act(() => {
      store.dispatch(requestSearch('asdf'));
    });

    const event =  assertDocument().createEvent('UIEvent');
    event.initEvent('resize');
    renderer.act(() => {
      Object.defineProperty(assertWindow(), 'innerWidth', {value: 1000});
      assertWindow().dispatchEvent(event);
      jest.runAllTimers();
    });

    // it is called initialy after establishing ref and then 3 times for our test cases
    expect(displayNoteProps.onHeightChange).toHaveBeenCalledTimes(4);
  });

  it('does not throw after unmout', () => {
    const highlight = { id: 'asdf', elements: [] } as any as Highlight;

    const component = renderer.create(<TestContainer store={store}>
      <DisplayNote {...displayNoteProps} highlight={highlight} isActive={false} />
    </TestContainer>);

    expect(() => component.unmount()).not.toThrow();
  });
});
