import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book, page } from '../../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../../test/TestContainer';
import { Store } from '../../../../types';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import { highlightLocationFilters } from '../../selectors';
import { HighlightData } from '../../types';
import { getHighlightLocationFilterForPage } from '../../utils';
import MenuToggle from '../MenuToggle';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightListElement from './HighlightListElement';
import * as utils from './utils';

describe('HighlightDeleteWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot when editing is set to false', () => {
    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation='Some annotation'
        isEditing={false}
        // tslint:disable-next-line: no-empty
        onSave={() => {}}
        // tslint:disable-next-line: no-empty
        onCancel={() => {}}
      />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('match snapshot when editing is set to true', () => {
    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation='Some annotation'
        isEditing={true}
        // tslint:disable-next-line: no-empty
        onSave={() => {}}
        // tslint:disable-next-line: no-empty
        onCancel={() => {}}
      />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onSave props', () => {
    let savedText = '';
    let cancelClicked = false;
    const annotation = 'TEST';

    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation={annotation}
        isEditing={true}
        onCancel={() => { cancelClicked = true; }}
        onSave={(text) => { savedText = text; }}
      />
    </TestContainer>);

    renderer.act(() => { return; });

    renderer.act(() => {
      const textarea = component.root.findByProps({ value: annotation });
      textarea.props.onChange({
        preventDefault: jest.fn(),
        target: {value: 'newAnno'},
      });
    });

    renderer.act(() => {
      const saveButton = component.root.findByProps({ 'data-testid': 'save' });
      saveButton.props.onClick();
      const cancelButton = component.root.findByProps({ 'data-testid': 'cancel' });
      cancelButton.props.onClick();
    });

    expect(savedText).toEqual('newAnno');
    expect(cancelClicked).toEqual(true);
  });
});

describe('Highlight annotation', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let highlight: ReturnType<typeof createMockHighlight>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    highlight = createMockHighlight('asdf');
  });

  it('edits annotation from MH pop up and track analytics', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);

    jest.spyOn(utils, 'createHighlightLink')
      .mockReturnValue('/link/to/highlight');

    const component = renderer.create(<TestContainer services={services} store={store}>
      <HighlightListElement
        highlight={highlight as unknown as HighlightData}
        locationFilterId={location!.id}
        pageId={page.id}
      />
    </TestContainer>);

    const track = jest.spyOn(services.analytics.editAnnotation, 'track');

    renderer.act(() => {
      const dropdown = component.root.findByType(MenuToggle);
      dropdown.props.onClick();
    });

    renderer.act(() => {
      const editButton = component.root.findByProps({ 'data-testid': 'edit' });
      editButton.props.onClick();
    });

    renderer.act(() => {
      const textarea = component.root.findByType('textarea');
      textarea.props.onChange({
        preventDefault: jest.fn(),
        target: {value: 'newAnno'},
      });
    });

    renderer.act(() => {
      const saveButton = component.root.findByProps({ 'data-testid': 'save' });
      saveButton.props.onClick();
    });

    expect(track).toHaveBeenCalled();
  });
});
