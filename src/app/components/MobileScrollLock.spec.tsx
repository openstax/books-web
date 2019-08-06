import { Document, Element, MediaQueryList } from '@openstax/types/lib.dom';
import ReactType, { ComponentType } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import rendererType from 'react-test-renderer';
import { renderToDom } from '../../test/reactutils';

describe('MobileScrollLock', () => {

  describe('in browser', () => {
    let MobileScrollLock: ComponentType; // tslint:disable-line:variable-name
    let React: typeof ReactType; // tslint:disable-line:variable-name
    beforeEach(() => {
      React = require('react');
      MobileScrollLock = require('./MobileScrollLock').default;
    });

    it('mounts and unmmounts with a dom', () => {
      if (!document) {
        return expect(document).toBeTruthy();
      }

      const {root} = renderToDom(<MobileScrollLock />);
      expect(() => unmountComponentAtNode(root)).not.toThrow();
    });

    describe('when scrolling', () => {
      let scrollyElement: Element;
      let nonScrollyElement: Element;
      let doc: Document;
      let win: Window;

      const touchEvent = (target: Element) => {
        const event = doc.createEvent('TouchEvent');
        event.initEvent('touchmove', true, true);
        const spy = jest.spyOn(event, 'preventDefault');

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
          const {spy} = touchEvent(nonScrollyElement);
          expect(spy).toHaveBeenCalled();
        });

        it('allows touchmove events when there is a scrollable parent (scrolling an element on page)', () => {
          const {spy} = touchEvent(scrollyElement);
          expect(spy).not.toHaveBeenCalled();
        });
      });

      describe('on desktop', () => {
        beforeEach(() => {
          win.matchMedia = () => ({matches: false}) as MediaQueryList;
        });

        it('allows touchmove events', () => {
          const {spy} = touchEvent(nonScrollyElement);
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
    let React: typeof ReactType; // tslint:disable-line:variable-name

    beforeEach(() => {
      jest.resetModules();
      delete (global as any).window;
      delete (global as any).document;

      const styled = require('styled-components');
      // this is broken when unmounting without a dom
      styled.createGlobalStyle = () => () => null;

      MobileScrollLock = require('./MobileScrollLock').default;
      React = require('react');
      renderer = require('react-test-renderer');
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
