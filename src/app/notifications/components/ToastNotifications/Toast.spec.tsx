import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { resetModules } from '../../../../test/utils';
import { assertDocument, assertWindow } from '../../../utils';
import { ToastNotification } from '../../types';
import { clearErrorAfter, shouldAutoDismissAfter } from './constants';
import Toast, { initialState, manageAnimationState } from './Toast';

jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

const toast: ToastNotification = {
  destination: 'page',
  messageKey: 'i18n:notification:toast:highlights:create-failure',
  shouldAutoDismiss: true,
  timestamp: Date.now(),
};

const position = {
  index: 1,
  totalToastCount: 1,
};

describe('Toast', () => {
  let window: Window;
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;
  let dismiss: jest.Mock;

  beforeEach(() => {
    resetModules();

    dismiss = jest.fn();

    window = assertWindow();
    addEventListener = jest.spyOn(window, 'addEventListener');
    removeEventListener = jest.spyOn(window, 'removeEventListener');

    jest.useFakeTimers();
  });

  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <Toast dismiss={dismiss} notification={toast} positionProps={position} />
    </TestContainer>);

    const tree = component.toJSON();
    component.unmount();
    expect(tree).toMatchSnapshot();

    renderer.act(() => {
      jest.runAllTimers();
    });
  });

  it('manages timeouts', () => {
    const component = renderer.create(<TestContainer>
      <Toast dismiss={dismiss} notification={toast} positionProps={position} />
    </TestContainer>);

    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), clearErrorAfter);
    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), shouldAutoDismissAfter);

    renderer.act(() => {
      jest.advanceTimersByTime(shouldAutoDismissAfter);
    });

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(addEventListener).toHaveBeenCalledWith('click', expect.anything());

    renderer.act(() => {
      jest.runAllTimers();
    });

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    expect(bannerBody.props.isFadingOut).toBe(true);

    component.unmount();
  });

  it('handles notifications which need to be dismissed manually', () => {
    const component = renderer.create(<TestContainer>
      <Toast dismiss={dismiss} notification={{...toast, shouldAutoDismiss: false}} positionProps={position} />
    </TestContainer>);

    renderer.act(() => {
      jest.runAllTimers();
    });

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    expect(bannerBody.props.isFadingOut).toBe(false);

    component.unmount();
  });

  it('dismisses on animation end', () => {
    const {root} = renderToDom(<TestContainer>
      <Toast dismiss={dismiss} notification={toast} positionProps={position}/>
    </TestContainer>);
    const wrapper = root.querySelector('[data-testid=banner-body]');

    if (!wrapper) {
      return expect(wrapper).toBeTruthy();
    }

    ReactTestUtils.Simulate.animationEnd(wrapper);

    expect(dismiss).toHaveBeenCalled();
  });

  it('dismisses notification on click', () => {
    const component = renderer.create(<TestContainer>
      <Toast dismiss={dismiss} notification={toast} positionProps={position} />
    </TestContainer>);

    renderer.act(() => {
      jest.advanceTimersByTime(shouldAutoDismissAfter);
    });

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    renderer.act(() => {
      const event = assertDocument().createEvent('MouseEvent');
      event.initEvent('click');
      assertWindow().dispatchEvent(event);
    });

    expect(bannerBody.props.isFadingOut).toBe(true);

    component.unmount();
  });

  it('resets when notification\'s timestamp changes', () => {
    const component = renderer.create(<TestContainer>
      <Toast dismiss={dismiss} notification={toast} positionProps={position} />
    </TestContainer>);

    renderer.act(() => {
      jest.advanceTimersByTime(shouldAutoDismissAfter);
    });

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    renderer.act(() => {
      const event = assertDocument().createEvent('MouseEvent');
      event.initEvent('click');
      assertWindow().dispatchEvent(event);
    });

    expect(bannerBody.props.isFadingOut).toBe(true);

    renderer.act(() => {
      component.update(<TestContainer>
        <Toast dismiss={dismiss} notification={{...toast, timestamp: Date.now() + 10}} positionProps={position} />
      </TestContainer>);
    });

    expect(bannerBody.props.isFadingOut).toBe(false);
    component.unmount();
  });

  describe('syncAnimationState', () => {
    it('doesn\'t allow to fade out if toast is not ready to be dismissed', () => {
      expect(manageAnimationState(initialState, 'start_fade_out')).toBe(initialState);
    });

    it('allows dismissing if component is ready', () => {
      const newState = manageAnimationState(initialState, 'allow_auto_dismiss');
      expect(manageAnimationState(newState, 'start_fade_out').isFadingOut).toBe(true);
    });

    it('returns unchanged state for unknown event', () => {
      expect(manageAnimationState(initialState, 'anything goes' as any)).toBe(initialState);
    });
  });
});
