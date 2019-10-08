import { Document, Element, HTMLElement, MediaQueryList } from '@openstax/types/lib.dom';
import { ComponentType } from 'react';
import rendererType from 'react-test-renderer';
import { reactAndFriends, resetModules } from '../../test/utils';

describe('MobileScrollLock', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
  let ReactDOM: ReturnType<typeof reactAndFriends>['ReactDOM']; // tslint:disable-line:variable-name

  describe('in browser', () => {
    let MobileScrollLock: ComponentType; // tslint:disable-line:variable-name
    beforeEach(() => {
      resetModules();
      ({React, renderToDom, ReactDOM} = reactAndFriends());
      MobileScrollLock = require('./MobileScrollLock').default;
    });

    it('mounts and unmmounts with a dom', () => {
      if (!document) {
        return expect(document).toBeTruthy();
      }

      const {root} = renderToDom(<MobileScrollLock />);
      expect(() => ReactDOM.unmountComponentAtNode(root)).not.toThrow();
    });

    describe('when scrolling', () => {
      let scrollyElement: HTMLElement;
      let nonScrollyElement: Element;
      let doc: Document;
      let win: Window;

      const touchEvent = (target: Element | null, height: number, eventType: string = 'touchmove') => {
        const event = doc.createEvent('TouchEvent');
        event.initEvent(eventType, true, true);
        const spy = jest.spyOn(event, 'preventDefault');

        Object.defineProperty(event, 'touches', {
          value: [{clientY: height, clientX: 0}],
          writable: false,
        });
        Object.defineProperty(event, 'target', {
          value: target,
          writable: false,
        });

        doc.dispatchEvent(event);

        return {event, spy};
      };

      beforeEach(() => {
        if (!document || !window) {
          throw new Error('jsdom...');
        }
        doc = document;
        win = window;

        scrollyElement = document.createElement('div');
        scrollyElement.style.overflow = 'scroll';
        Object.defineProperty(scrollyElement, 'offsetHeight', {
          value: 1000,
          writable: false,
        });
        Object.defineProperty(scrollyElement, 'scrollHeight', {
          value: 5000,
          writable: false,
        });

        nonScrollyElement = document.createElement('div');
        Object.defineProperty(nonScrollyElement, 'offsetHeight', {
          value: 1000,
          writable: false,
        });
        Object.defineProperty(nonScrollyElement, 'scrollHeight', {
          value: 1000,
          writable: false,
        });

        renderToDom(<MobileScrollLock />);
      });

      describe('on mobile', () => {
        beforeEach(() => {
          win.matchMedia = () => ({matches: true}) as MediaQueryList;
        });

        it('prevents touchmove events when there is no scrollable parent (scrolling the window)', () => {
          touchEvent(nonScrollyElement, 10, 'touchstart');
          const {spy} = touchEvent(nonScrollyElement, 5);
          expect(spy).toHaveBeenCalled();
        });

        it('allows touchmove events when there is a scrollable parent (scrolling an element on page)', () => {
          touchEvent(scrollyElement, 10, 'touchstart');
          const {spy} = touchEvent(scrollyElement, 5);
          expect(spy).not.toHaveBeenCalled();
        });

        it('does nothing if the element isnull', () => {
          touchEvent(null, 10, 'touchstart');
          const {spy} = touchEvent(null, 10);
          expect(spy).not.toHaveBeenCalled();
        });

        it('does nothing on touch without scroll', () => {
          touchEvent(scrollyElement, 10, 'touchstart');
          const {spy} = touchEvent(scrollyElement, 10);
          expect(spy).not.toHaveBeenCalled();
        });

        it('blocks touchmove events when the element is at its scroll limit', () => {
          Object.defineProperty(scrollyElement, 'scrollTop', {
            value: 4000,
            writable: false,
          });
          touchEvent(scrollyElement, 10, 'touchstart');
          const {spy} = touchEvent(scrollyElement, 5);
          expect(spy).toHaveBeenCalled();
        });

        it('allows scrolling back after reaching the end', () => {
          Object.defineProperty(scrollyElement, 'scrollTop', {
            value: 4000,
            writable: false,
          });
          touchEvent(scrollyElement, 10, 'touchstart');
          const spy1 = touchEvent(scrollyElement, 5).spy;
          expect(spy1).toHaveBeenCalled();
          touchEvent(scrollyElement, 5, 'touchend');

          touchEvent(scrollyElement, 5, 'touchstart');
          const spy2 = touchEvent(scrollyElement, 10).spy;
          expect(spy2).not.toHaveBeenCalled();
        });
      });

      describe('on desktop', () => {
        beforeEach(() => {
          win.matchMedia = () => ({matches: false}) as MediaQueryList;
        });

        it('allows touchmove events', () => {
          const {spy} = touchEvent(nonScrollyElement, 5);
          expect(spy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    let renderer: typeof rendererType;
    let MobileScrollLock: ComponentType; // tslint:disable-line:variable-name

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
      resetModules();
      ({React, renderToDom, renderer} = reactAndFriends());

      const styled = require('styled-components');
      // this is broken when unmounting without a dom
      styled.createGlobalStyle = () => () => null;

      MobileScrollLock = require('./MobileScrollLock').default;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('mounts and unmounts without a dom', () => {
      const component = renderer.create(<MobileScrollLock />);
      expect(() => component.unmount()).not.toThrow();
    });
  });
});
