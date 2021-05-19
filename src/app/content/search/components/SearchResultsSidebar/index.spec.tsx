import { SearchResultHitSourceElementTypeEnum } from '@openstax/open-search-client';
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SearchResultsSidebar from '.';
import createTestStore from '../../../../../test/createTestStore';
import {
  book as archiveBook,
  page,
  pageInChapter,
  pageInOtherChapter
} from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import {
  makeEvent,
  makeFindByTestId,
  makeFindOrNullByTestId,
  renderToDom
} from '../../../../../test/reactutils';
import {
  makeSearchResultHit,
  makeSearchResults
} from '../../../../../test/searchResults';
import TestContainer from '../../../../../test/TestContainer';
import { Store } from '../../../../types';
import { assertDocument, assertWindow } from '../../../../utils';
import { receiveBook, receivePage } from '../../../actions';
import { formatBookData } from '../../../utils';
import * as domUtils from '../../../utils/domUtils';
import {
  clearSearch,
  closeSearchResultsMobile,
  receiveSearchResults,
  requestSearch,
  selectSearchResult
} from '../../actions';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';

describe('SearchResultsSidebar', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  const animationEvent = () => {
    return new (assertWindow().Event)('webkitAnimationEnd');
  };

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    store.dispatch(receiveBook(formatBookData(archiveBook, mockCmsBook)));
  });

  const render = () => (
    <TestContainer store={store}>
      <SearchResultsSidebar/>
    </TestContainer>
  );

  it('mounts and unmounts without a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    expect(() => component.unmount()).not.toThrow();
  });

  it('mounts and unmmounts with a dom', () => {
    store.dispatch(requestSearch('cool search'));
    const { root } = renderToDom(render());
    expect(() => unmountComponentAtNode(root)).not.toThrow();
  });

  it('is initially null when there is no search', () => {
    const component = renderer.create(render());
    const findById = makeFindOrNullByTestId(component.root);

    expect(findById('search-results-sidebar')).toBe(null);
  });

  it('is hidden after search is cleared', () => {
    const component = renderer.create(render());

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
    });
    renderer.act(() => {
      store.dispatch(clearSearch());
    });

    const findById = makeFindByTestId(component.root);

    expect(findById('search-results-sidebar').props.searchResultsOpen).toBe(false);
  });

  it('shows sidebar with loading state if there is a search', () => {
    store.dispatch(requestSearch('cool search'));
    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(() => findById('loader')).not.toThrow();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for no search results', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([])));

    const tree = renderer.create(render()).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with results', () => {
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('cool search'));
    const selectedResult = makeSearchResultHit({ book: archiveBook, page });
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([
          selectedResult,
          makeSearchResultHit({ book: archiveBook, page: pageInChapter }),
          makeSearchResultHit({ book: archiveBook, page: pageInOtherChapter }),
        ])
      )
    );
    store.dispatch(selectSearchResult({result: selectedResult, highlight: 0}));

    const tree = renderer.create(render()).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with related key terms', () => {
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('term1'));
    const selectedResult = makeSearchResultHit({
      book: archiveBook,
      elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
      highlights: ['descritpion 1'],
      page,
      title: 'term1 - selected',
    });
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([
          selectedResult,
          makeSearchResultHit({
            book: archiveBook,
            elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
            highlights: ['descritpion 2'],
            page: pageInChapter,
            title: 'term2',
          }),
          makeSearchResultHit({ book: archiveBook, page: pageInOtherChapter }),
        ])
      )
    );
    store.dispatch(selectSearchResult({result: selectedResult, highlight: 0}));

    const tree = renderer.create(render()).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('closes mobile search results when related key term is is clicked', () => {
    store.dispatch(receivePage({ ...pageInChapter, references: [] }));
    store.dispatch(requestSearch('term'));
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([
          makeSearchResultHit({
            book: archiveBook,
            elementType: SearchResultHitSourceElementTypeEnum.KeyTerm,
            highlights: ['descritpion'],
            page: pageInChapter,
            title: 'term',
          }),
        ])
      )
    );

    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(dispatch).not.toHaveBeenCalledWith(closeSearchResultsMobile());

    renderer.act(() => {
      findById('related-key-term-result').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(closeSearchResultsMobile());
  });

  it('doesn\'t move focus when loading without results', () => {
    const activeElement = assertDocument().activeElement;
    renderToDom(render());

    expect(assertDocument().activeElement).toBe(activeElement);

    store.dispatch(receivePage({ ...page, references: [] }));
    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults([])));

    expect(assertDocument().activeElement).toBe(activeElement);
  });

  it('closes search results when one is clicked', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([makeSearchResultHit({ book: archiveBook, page })])
      )
    );

    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(dispatch).not.toHaveBeenCalledWith(closeSearchResultsMobile());

    renderer.act(() => {
      findById('search-result').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(closeSearchResultsMobile());
  });

  it('clears search when closed', () => {
    store.dispatch(requestSearch('cool search'));
    store.dispatch(
      receiveSearchResults(
        makeSearchResults([makeSearchResultHit({ book: archiveBook, page })])
      )
    );

    const component = renderer.create(render());
    const findById = makeFindByTestId(component.root);

    expect(dispatch).not.toHaveBeenCalledWith(clearSearch());

    renderer.act(() => {
      findById('close-search').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(clearSearch());
  });

  it('fixes overscroll in safari', () => {
    const {tree} = renderToDom(render());
    const fixForSafariMock = jest.spyOn(domUtils, 'fixSafariScrolling');

    store.dispatch(requestSearch('cool search'));
    store.dispatch(receiveSearchResults(makeSearchResults()));

    const sidebar = ReactTestUtils.findRenderedComponentWithType(tree, SearchResultsBarWrapper);

    jest.useFakeTimers();
    if (sidebar.searchSidebar.current) {
      sidebar.searchSidebar.current.dispatchEvent(animationEvent());
    }
    jest.runAllTimers();

    expect(fixForSafariMock).toHaveBeenCalled();
  });
});
