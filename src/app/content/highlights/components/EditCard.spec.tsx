import { Highlight } from '@openstax/highlighter';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { testAccountsUser } from '../../../../test/mocks/userLoader';
import { makeFindByTestId } from '../../../../test/reactutils';
import * as selectAuth from '../../../auth/selectors';
import { formatUser } from '../../../auth/utils';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { assertDocument } from '../../../utils';
import { updateHighlight } from '../actions';
import { highlightStyles } from '../constants';
import ColorPicker from './ColorPicker';
import EditCard, { EditCardProps } from './EditCard';
import Note from './Note';
import * as onClickOutsideModule from './utils/onClickOutside';

jest.mock('./ColorPicker', () => (props: any) => <div mock-color-picker {...props} />);
jest.mock('./Note', () => (props: any) => <div mock-note {...props} />);
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} data={data} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with data', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when editing', () => {
    highlight.getStyle.mockReturnValue('red');
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={highlightData}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              isFocused={true}
              data={data}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} data={data} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={highlightData}
              locationFilterId='locationId'
              pageId='pageId'
              isFocused={true}
              onCreate={jest.fn()}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              locationFilterId='locationId'
              pageId='pageId'
              isFocused={true}
              data={data}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
              hasUnsavedHighlight={false}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={data}
              isFocused={true}
              hasUnsavedHighlight={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
    const note = component.root.findByType(Note);

    renderer.act(() => {
      note.props.onChange('qwer');
    });
    expect(editCardProps.setAnnotationChangesPending).toHaveBeenCalledWith(false);
  });

  it('handles color change when there is data', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              data={highlightData}
              locationFilterId='locationId'
              pageId='pageId'
              isFocused={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
    }));
  });

  it('creates when changing color on a new highlight', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} data={highlightData} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const note = component.root.findByType(Note);
    renderer.act(() => {
      note.props.onFocus();
    });

    expect(highlight.setStyle).not.toHaveBeenCalled();
    expect(editCardProps.onCreate).not.toHaveBeenCalled();
  });

  it('blurs when clicking outside', () => {
    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard {...editCardProps} isFocused={true} />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    onClickOutside.mock.calls[0][2]({} as any);

    expect(component).toBeTruthy();
    expect(onClickOutside.mock.calls.length).toBe(1);
    expect(editCardProps.onBlur).toHaveBeenCalled();
  });

  it('doesn\'t blur when clicking outside and editing', () => {
    highlight.getStyle.mockReturnValue('red');

    const onClickOutside = jest.spyOn(onClickOutsideModule, 'default');
    onClickOutside.mockReturnValue(() => () => null);

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              isFocused={true}
              data={highlightData}
              hasUnsavedHighlight={true}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              isFocused={true}
              data={undefined}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
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
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider onError={() => null}>
            <EditCard
              {...editCardProps}
              isFocused={true}
              onHeightChange={onHeightChange}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>,
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
});
