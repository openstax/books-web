import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import GoToTopButton from '../../../components/GoToTopButton';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import { loadMoreStudyGuides } from '../actions';
import * as selectors from '../selectors';
import ShowStudyGuides, { StudyGuidesBody } from './ShowStudyGuides';

describe('ShowStudyGuides', () => {
  let store: Store;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();

    window = assertWindow();
  });

  it('doesn\'t request more if not at bottom', () => {
    const container = window.document.createElement('div');
    const dispatch = jest.spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(true);

    const component = renderer.create(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>, { createNodeMock: () => container });

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 100 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).not.toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('dispatch loadMoreStudyGuides when scrolling down', () => {
    const container = window.document.createElement('div');
    const dispatch = jest.spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(true);

    const component = renderer.create(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('do not requests more highlights when there is no more results', () => {
    const container = window.document.createElement('div');
    const dispatch = spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(false);

    const component = renderer.create(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).not.toHaveBeenCalledWith(loadMoreStudyGuides());
  });

  it('do not requests more highlights when already loading', () => {
    const container = window.document.createElement('div');
    const dispatch = jest.spyOn(store, 'dispatch');

    jest.spyOn(selectors, 'summaryIsLoading')
      .mockReturnValue(true);

    jest.spyOn(selectors, 'hasMoreResults')
      .mockReturnValue(true);

    const component = renderer.create(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>, { createNodeMock: () => container});

    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'offsetHeight', { value: 100 });
    Object.defineProperty(container, 'scrollTop', { value: 900 });

    dispatch.mockClear();

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    expect(dispatch).toHaveBeenCalledTimes(0);
  });

  it('shows back to top button on scroll and works on click', async() => {
    const container = window.document.createElement('div');

    const component = renderer.create(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>, { createNodeMock: () => container });

    Object.defineProperty(container, 'height', { value: 1000 });
    Object.defineProperty(container, 'scrollTop', { value: 10, writable: true });

    const sgWrapper = component.root.findByType(StudyGuidesBody);

    renderer.act(() => {
      sgWrapper.props.onScroll();
    });

    const backToTop = component.root.findByType(GoToTopButton);
    // this assertion isn't really necessary but makes the test intentions easier to read
    expect(backToTop).toBeTruthy();

    renderer.act(() => {
      backToTop.props.onClick();
    });

    expect(container.scrollTop).toBe(0);
    expect(() => component.root.findByType(GoToTopButton)).toThrow();
  });

  it('does not scroll to top without ref', () => {
    const {root} = renderToDom(<TestContainer store={store}>
      <ShowStudyGuides />
    </TestContainer>);

    const target = root.querySelector('[data-testid="show-studyguides-body"]');
    if (!target) {
      return expect(target).toBeTruthy();
    }

    Object.defineProperty(target, 'height', { value: 1000 });
    Object.defineProperty(target, 'scrollTop', { value: 10, writable: true });

    ReactTestUtils.Simulate.scroll(target);

    let backToTop = root.querySelector('[data-testid="back-to-top-studyguides"]');
    if (!backToTop) {
      return expect(backToTop).toBeTruthy();
    }

    ReactDOM.unmountComponentAtNode(root);

    ReactTestUtils.Simulate.click(backToTop);
    ReactTestUtils.Simulate.scroll(target);

    expect(target.scrollTop).toBe(10);
    backToTop = root.querySelector('[data-testid="back-to-top-studyguides"]');
    expect(backToTop).toBeFalsy();
  });
});
