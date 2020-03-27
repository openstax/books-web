import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SearchFailure, { shouldAutoDismissAfter, syncState } from '.';
import { renderToDom } from '../../../../test/reactutils';
import { resetModules } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { assertDocument, assertWindow } from '../../../utils';
import { clearErrorAfter } from './styles';

jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

const selectedHighlight = {} as any;

describe('SearchFailure', () => {
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
    const component = renderer.create(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={selectedHighlight} />
    </MessageProvider>);

    const tree = component.toJSON();
    component.unmount();
    expect(tree).toMatchSnapshot();

    renderer.act(() => {
      jest.runAllTimers();
    });
  });

  it('matches snapshot when mobile toolbar is open', () => {
    const component = renderer.create(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={true} selectedHighlight={selectedHighlight}  />
    </MessageProvider>);

    const tree = component.toJSON();
    component.unmount();
    expect(tree).toMatchSnapshot();

    renderer.act(() => {
      jest.runAllTimers();
    });
  });

  it('manages timeouts', async() => {
    const component = renderer.create(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={selectedHighlight}  />
    </MessageProvider>);

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

  it('dismisses on animation end', () => {
    const {root} = renderToDom(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={selectedHighlight}  />
    </MessageProvider>);
    const wrapper = root.querySelector('[data-testid=banner-body]');

    if (!wrapper) {
      return expect(wrapper).toBeTruthy();
    }

    ReactTestUtils.Simulate.animationEnd(wrapper);

    expect(dismiss).toHaveBeenCalled();
  });

  it('dismisses notification on click', () => {
    const component = renderer.create(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={selectedHighlight}  />
    </MessageProvider>);

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

  it('resets when selected highlight changes', () => {
    const component = renderer.create(<MessageProvider>
      <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={selectedHighlight}  />
    </MessageProvider>);

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
      component.update(<MessageProvider>
        <SearchFailure dismiss={dismiss} mobileToolbarOpen={false} selectedHighlight={{} as any}  />
      </MessageProvider>);
    });

    expect(bannerBody.props.isFadingOut).toBe(false);
    component.unmount();
  });

  describe('syncState', () => {
    it('doesn\'t allow to fade out if error is not ready to be dimissed', () => {
      const state = { isFadingOut: false, shouldAutoDismiss: false};
      expect(syncState(state)).toBe(state);
    });
  });
});
