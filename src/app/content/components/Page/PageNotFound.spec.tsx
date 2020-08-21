import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { openToc } from '../../actions';
import { tocOpen } from '../../selectors';
import { SidebarControl } from '../Toolbar/styled';
import PageNotFound from './PageNotFound';

describe('PageNotFound', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('renders correctly', () => {
    const { root } = renderer.create(<Provider store={store}>
      <MessageProvider>
        <PageNotFound />
      </MessageProvider>
    </Provider>);

    expect(root.findByProps({ id: 'i18n:page-not-found:heading' })).toBeTruthy();
    expect(root.findByProps({ id: 'i18n:page-not-found:text-before-button' })).toBeTruthy();
    expect(root.findByType(SidebarControl)).toBeTruthy();
  });

  it('opens toc when clicking on the button', () => {
    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <PageNotFound />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openToc());
  });

  it('clicking multiple times on the button does not close toc', () => {
    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <PageNotFound />
      </MessageProvider>
    </Provider>);

    expect(tocOpen(store.getState())).toEqual(null);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openToc());
    expect(tocOpen(store.getState())).toEqual(true);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(tocOpen(store.getState())).toEqual(true);
  });
});
