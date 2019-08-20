import noop from 'lodash/fp/noop';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../test/createTestStore';
import { makeEvent, makeFindByTestId, makeFindOrNullByTestId, makeInputEvent } from '../../../test/reactutils';
import { makeSearchResults } from '../../../test/searchResults';
import MessageProvider from '../../MessageProvider';
import { Store } from '../../types';
import { assertDocument, assertWindow } from '../../utils';
import {
  closeSearchResultsMobile,
  openSearchResultsMobile,
  receiveSearchResults,
  requestSearch
} from '../search/actions';
import Toolbar from './Toolbar';

describe('print button', () => {
  let store: Store;
  let print: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    print = jest.spyOn(assertWindow(), 'print');
    print.mockImplementation(noop);
  });

  it('prints', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Toolbar />
      </MessageProvider>
    </Provider>);

    const event = {
      preventDefault: jest.fn(),
    };

    component.root.findByProps({'data-testid': 'print'}).props.onClick(event);

    expect(print).toHaveBeenCalled();
  });
});

describe('search', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  const render = () => renderer.create(<Provider store={store}>
    <MessageProvider>
      <Toolbar />
    </MessageProvider>
  </Provider>);

  it('opens and closes mobile interface', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const event = makeEvent();

    renderer.act(() => {
      findById('mobile-toggle').props.onClick(event);
    });
    expect(() => findById('mobile-search')).not.toThrow();
    renderer.act(() => {
      findById('mobile-toggle').props.onClick(event);
    });
    expect(() => findById('mobile-search')).toThrow();
    expect(event.preventDefault).toHaveBeenCalledTimes(2);
  });

  it('doesn\'t dispatch search for empty string', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => {
      findById('desktop-search').props.onSubmit(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();

    expect(dispatch).not.toHaveBeenCalledWith(requestSearch('cool search'));
  });

  it('loads search query into text input', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    expect(findById('desktop-search-input').props.value).toEqual('');
    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
    });
    expect(findById('desktop-search-input').props.value).toEqual('cool search');
  });

  it('tries to blur the focused element on submit', () => {
    const component = render();
    const document = assertDocument();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(inputEvent);
    });

    const htmlelement = document.createElement('div');
    Object.defineProperty(document, 'activeElement', {value: htmlelement, writable: true});
    const blur1 = jest.spyOn(htmlelement, 'blur');
    renderer.act(() => findById('desktop-search').props.onSubmit(makeEvent()));
    expect(blur1).toHaveBeenCalled();

    // test non HTMLElement branch
    const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.defineProperty(document, 'activeElement', {value: svgelement});
    const blur2 = jest.spyOn(svgelement, 'blur');
    renderer.act(() => findById('desktop-search').props.onSubmit(makeEvent()));
    expect(blur2).not.toHaveBeenCalled();
  });

  it('search and clear work on desktop', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const inputEvent = makeInputEvent('cool search');
    findById('desktop-search-input').props.onChange(inputEvent);

    const event = makeEvent();
    renderer.act(() => findById('desktop-search').props.onSubmit(event));
    expect(event.preventDefault).toHaveBeenCalled();

    renderer.act(() => {
      expect(dispatch).toHaveBeenCalledWith(requestSearch('cool search'));
    });

    expect(findById('desktop-search-input').props.value).toEqual('cool search');

    const clearClick = makeEvent();
    renderer.act(() => {
      findById('desktop-clear-search').props.onClick(clearClick);
    });
    expect(clearClick.preventDefault).toHaveBeenCalled();

    expect(findById('desktop-search-input').props.value).toEqual('');
  });

  it('search and clear work on mobile', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      findById('mobile-toggle').props.onClick(makeEvent());
    });

    const inputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('mobile-search-input').props.onChange(inputEvent);
    });

    const event = makeEvent();
    renderer.act(() => findById('mobile-search').props.onSubmit(event));
    expect(event.preventDefault).toHaveBeenCalled();

    renderer.act(() => {
      expect(dispatch).toHaveBeenCalledWith(requestSearch('cool search'));
    });

    expect(findById('mobile-search-input').props.value).toEqual('cool search');

    const clearClick = makeEvent();
    renderer.act(() => {
      findById('mobile-clear-search').props.onClick(clearClick);
    });
    expect(clearClick.preventDefault).toHaveBeenCalled();

    expect(findById('mobile-search-input').props.value).toEqual('');
  });

  it('shows the "back to results" link after selecting a result', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);
    const findOrNull = makeFindOrNullByTestId(component.root);

    expect(findOrNull('back-to-search-results')).toBe(null);

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
      store.dispatch(closeSearchResultsMobile());
    });

    expect(findById('back-to-search-results')).toBeTruthy();
  });

  it('clicking "back to results" opens results', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    renderer.act(() => {
      store.dispatch(requestSearch('cool search'));
      store.dispatch(receiveSearchResults(makeSearchResults()));
      store.dispatch(closeSearchResultsMobile());
    });

    expect(dispatch).not.toHaveBeenCalledWith(openSearchResultsMobile());

    renderer.act(() => {
      findById('back-to-search-results').props.onClick(makeEvent());
    });

    expect(dispatch).toHaveBeenCalledWith(openSearchResultsMobile());
  });

  it('input value syncs between mobile and desktop', () => {
    const component = render();
    const findById = makeFindByTestId(component.root);

    const desktopInputEvent = makeInputEvent('cool search');
    renderer.act(() => {
      findById('desktop-search-input').props.onChange(desktopInputEvent);

      findById('mobile-toggle').props.onClick(makeEvent());
    });

    expect(findById('mobile-search-input').props.value).toEqual('cool search');
    const inputEvent = makeInputEvent('asdf');
    renderer.act(() => {
      findById('mobile-search-input').props.onChange(inputEvent);

      findById('mobile-toggle').props.onClick(makeEvent());
    });

    expect(findById('desktop-search-input').props.value).toEqual('asdf');
  });
});
