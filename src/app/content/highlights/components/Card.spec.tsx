import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import createMockHighlight from '../../../../test/mocks/highlight';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { requestSearch } from '../../search/actions';
import { deleteHighlight, focusHighlight, receiveHighlights } from '../actions';
import { highlightStyles } from '../constants';
import Card from './Card';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';

jest.mock('./DisplayNote', () => (props: any) => <div mock-display-note {...props} />);
jest.mock('./EditCard', () => (props: any) => <div mock-edit {...props} />);

describe('Card', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let highlight: ReturnType<typeof createMockHighlight>;
  let highlightData: ReturnType<ReturnType<typeof createMockHighlight>['serialize']>['data'];

  beforeEach(() => {
    store = createTestStore();
    highlight = createMockHighlight('asdf');
    highlightData = highlight.serialize().data;
    dispatch = jest.spyOn(store, 'dispatch');
    highlight.elements = [assertDocument().createElement('span')];
  });

  it('matches snapshot when focused without note', () => {
    highlight.range.getBoundingClientRect.mockReturnValue({
      bottom: 200,
      top: 100,
    });
    highlight.range.commonAncestorContainer = {
      nodeName: 'div',
      nodeType: 1,
      offsetParent: {
        nodeName: 'div',
        nodeType: 1,
        offsetTop: 50,
        title: '',
      },
      title: '',
    } as unknown as HTMLElement;
    store.dispatch(receiveHighlights([
      {
        style: highlightStyles[0].label,
        ...highlightData,
      },
    ]));
    store.dispatch(focusHighlight(highlight.id));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot when passed data without note', () => {
    store.dispatch(receiveHighlights([
      highlight.serialize().data,
    ]));
    store.dispatch(requestSearch('asdf'));
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('unknown style doesn\'t throw', () => {
    store.dispatch(receiveHighlights([
      {
        style: 'asdfasdfadsf',
        ...highlight.serialize().data,
      },
    ]));
    expect(() => renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>)).not.toThrow();
  });

  it('switches to editing mode when onEdit is triggered', () => {
    store.dispatch(receiveHighlights([
      {
        ...highlight.serialize().data,
        note: 'adsf',
        style: highlightStyles[0].label,
      },
    ]));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onEdit();
    });

    expect(() => component.root.findByType(EditCard)).not.toThrow();
  });

  it('removes when DisplayNote calls onRemove', () => {
    store.dispatch(receiveHighlights([
      {
        ...highlight.serialize().data,
        note: 'adsf',
        style: highlightStyles[0].label,
      },
    ]));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(DisplayNote);
    renderer.act(() => {
      picker.props.onRemove();
    });

    expect(dispatch).toHaveBeenCalledWith(deleteHighlight(highlight.id));
  });

  it('noops when remove is called but there isn\'t anything to remove', () => {
    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    const picker = component.root.findByType(EditCard);
    picker.props.onRemove();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('renders null if highlight doen\'t have range', () => {
    (highlight as any).range = undefined;

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });

  it('renders null if highlight doen\'t have range and its focused', () => {
    (highlight as any).range = undefined;
    store.dispatch(receiveHighlights([
      {
        style: highlightStyles[0].label,
        ...highlightData,
      },
    ]));
    store.dispatch(focusHighlight(highlight.id));

    const component = renderer.create(<Provider store={store}>
      <Card highlight={highlight as unknown as Highlight} />
    </Provider>);

    expect(() => component.root.findByType(EditCard)).toThrow();
  });
});
