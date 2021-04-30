import { Highlight } from '@openstax/highlighter';
import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React, { ReactElement } from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { makeFindByTestId } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import * as selectAuth from '../../../auth/selectors';
import { formatUser } from '../../../auth/utils';
import { assertDocument } from '../../../utils';
import { highlightStyles } from '../../constants';
import { updateHighlight } from '../actions';
import ColorPicker from './ColorPicker';
import EditCard, { EditCardProps } from './EditCard';
import Note from './Note';
import * as onClickOutsideModule from './utils/onClickOutside';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./Note', () => (props: any) => <div mock-note {...props} ref={props.textareaRef} />);
jest.mock('./Confirmation', () => (props: any) => <div mock-confirmation {...props} />);

describe('EditCard', () => {
  const highlight = createMockHighlight('asdf');
  const highlightData = highlight.serialize().data;
  const services = createTestServices();
  const store = createTestStore();
  const dispatch = jest.spyOn(store, 'dispatch');
  let editCardProps: Partial<EditCardProps>;

  beforeEach(() => {
    jest.resetAllMocks();
    highlight.elements = [assertDocument().createElement('span')];
    editCardProps = {
      highlight: highlight as unknown as Highlight,
      onBlur: jest.fn(),
      onCancel: jest.fn(),
      onCreate: jest.fn(),
      onRemove: jest.fn(),
      setAnnotationChangesPending: jest.fn(),
    };
  });

  it('matches snapshot when focused', () => {
    const data = {
      color: highlightStyles[0].label,
      ...highlightData,
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} data={data} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with data', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when editing', () => {
    highlight.getStyle.mockReturnValue('red');
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          isActive={true}
        />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('chains ColorPicker onRemove', () => {
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={data}
        />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).toHaveBeenCalled();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a note', () => {
    const data = {
      ...highlightData,
      annotation: 'asdf',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
            <EditCard {...editCardProps} data={data} isActive={true} />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).not.toHaveBeenCalled();
  });

  it('doesn\'t chain ColorPicker onRemove if there is a pending note', () => {
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: '',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(editCardProps.onRemove).not.toHaveBeenCalled();
  });

  it('cancelling resets the form state', () => {
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    expect(component.root.findAllByType('button').length).toBe(2);
    expect(note.props.note).toBe('asdf');

    const cancel = findByTestId('cancel');
    renderer.act(() => {
      cancel.props.onClick({preventDefault: jest.fn()});
    });

    expect(note.props.note).toBe('qwer');
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
  });

  it('save saves', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
          onCreate={jest.fn()}
        />
      </TestContainer>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {color: highlightData.style as any, annotation: 'asdf'},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: highlightData.annotation,
          color: highlightData.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(component.root.findAllByType('button').length).toBe(0);
    expect(editCardProps.onCancel).toHaveBeenCalled();
  });

  it('removing note shows confirmation', () => {
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    expect(() => findByTestId('confirm-delete')).not.toThrow();
  });

  it('confirmation can save', () => {
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
          data={data}
        />
      </TestContainer>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    const confirmation = findByTestId('confirm-delete');
    renderer.act(() => {
      confirmation.props.onConfirm();
      confirmation.props.always();
    });

    expect(() => findByTestId('confirm-delete')).toThrow();
    expect(dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {color: highlightData.style as any, annotation: ''},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: data.annotation,
          color: data.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(editCardProps.onCancel).toHaveBeenCalled();
  });

  it('confirmation can cancel', () => {
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
        />
      </TestContainer>
    );
    const findByTestId = makeFindByTestId(component.root);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('');
    });

    const saveButton = findByTestId('save');
    renderer.act(() => {
      saveButton.props.onClick({preventDefault: jest.fn()});
    });

    const confirmation = findByTestId('confirm-delete');
    renderer.act(() => {
      confirmation.props.onCancel();
      confirmation.props.always();
    });

    expect(() => findByTestId('confirm-delete')).toThrow();
    expect(dispatch).not.toHaveBeenCalled();
    expect(note.props.note).toBe('qwer');
  });

  it('responds to changes', () => {
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
          hasUnsavedHighlight={false}
        />
      </TestContainer>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('');
    });
    expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(true);
  });

  it('dispatches if changes are reverted', () => {
    highlight.getStyle.mockReturnValue('red');
    const data = {
      ...highlightData,
      annotation: 'qwer',
    };
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={data}
          isActive={true}
          hasUnsavedHighlight={true}
        />
      </TestContainer>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('qwer');
    });
    expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(false);
  });

  it('handles color change when there is data', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          data={highlightData}
          locationFilterId='locationId'
          pageId='pageId'
          isActive={true}
        />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(store.dispatch).toHaveBeenCalledWith(updateHighlight({
      highlight: {annotation: highlightData.annotation, color: 'blue' as any},
      id: highlightData.id,
    }, {
      locationFilterId: 'locationId',
      pageId: 'pageId',
      preUpdateData: {
        highlight: {
          annotation: highlightData.annotation,
          color: highlightData.style as HighlightUpdateColorEnum,
        },
        id: highlightData.id,
      },
    }));
  });

  it('creates when changing color on a new highlight', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    const picker = component.root.findByType(ColorPicker);
    renderer.act(() => {
      picker.props.onChange('blue');
    });

    expect(highlight.setStyle).toHaveBeenCalledWith('blue');
    expect(editCardProps.onCreate).toHaveBeenCalled();
  });

  it('sets color and creates when you focus', () => {
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).toHaveBeenCalledWith(highlightStyles[0].label);
    expect(editCardProps.onCreate).toHaveBeenCalled();
  });

  it('focusing an existing note does nothing', () => {
    highlight.getStyle.mockReturnValue('red');
    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} data={highlightData} />
      </TestContainer>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).not.toHaveBeenCalled();
    expect(editCardProps.onCreate).not.toHaveBeenCalled();
  });

  it('blurs when clicking outside', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'useOnClickOutside');
    onClickOutside.mockReturnValue();

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} isActive={true} />
      </TestContainer>
    );

    onClickOutside.mock.calls[0][2]({} as any);

    expect(component).toBeTruthy();
    expect(onClickOutside.mock.calls.length).toBe(1);
    expect(editCardProps.onBlur).toHaveBeenCalled();
  });

  it('doesn\'t blur when clicking outside and editing', () => {
    highlight.getStyle.mockReturnValue('red');

    const onClickOutside = jest.spyOn(onClickOutsideModule, 'useOnClickOutside');
    onClickOutside.mockReturnValue();

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={highlightData}
          hasUnsavedHighlight={true}
        />
      </TestContainer>
    );

    renderer.act(() => undefined);

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onChange('asdf');
    });

    onClickOutside.mock.calls[1][2]({} as any);

    expect(onClickOutside.mock.calls.length).toBe(2);
    expect(editCardProps.onBlur).not.toHaveBeenCalled();
    expect(editCardProps.onCancel).not.toHaveBeenCalled();
  });

  it('trackShowCreate for authenticated user', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const mockSpyUser = jest.spyOn(selectAuth, 'user')
      .mockReturnValue(formatUser(testAccountsUser));

    const spyAnalytics = jest.spyOn(services.analytics.showCreate, 'track');

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          data={undefined}
        />
      </TestContainer>
    );

    expect(spyAnalytics).not.toHaveBeenCalled();

    // Wait for React.useEffect
    renderer.act(() => undefined);

    expect(() => component.root.findByProps({
      'data-analytics-region': 'highlighting-login',
    })).toThrow();
    expect(spyAnalytics).toHaveBeenCalled();
    mockSpyUser.mockClear();
  });

  it('call onHeightChange when element mounts', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const onHeightChange = jest.fn();
    const createNodeMock = () => assertDocument().createElement('div');

    const component = renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard
          {...editCardProps}
          isActive={true}
          onHeightChange={onHeightChange}
        />
      </TestContainer>,
      {createNodeMock}
    );

    expect(onHeightChange).not.toHaveBeenCalled();

    // Wait for mount
    renderer.act(() => undefined);

    expect(() => component.root.findByProps({
      'data-analytics-region': 'edit-note',
    })).not.toThrow();
    expect(onHeightChange).toHaveBeenCalled();
  });

  it('focuses textarea if shouldFocusCard is set to true', () => {
    const editCard = assertDocument().createElement('div');
    const textarea = assertDocument().createElement('textarea');

    const spyTextareaFocus = jest.spyOn(textarea, 'focus');

    const createNodeMock = (element: ReactElement) => {
      if (element.type === 'form') {
        return editCard;
      } else {
        return textarea;
      }
    };

    const onHeightChange = jest.fn();

    renderer.create(
      <TestContainer services={services} store={store}>
        <EditCard {...editCardProps} onHeightChange={onHeightChange} shouldFocusCard={true} />
      </TestContainer>,
      {createNodeMock}
    );

    // Wait for hooks
    renderer.act(() => undefined);

    expect(spyTextareaFocus).toHaveBeenCalledTimes(1);
  });
});
