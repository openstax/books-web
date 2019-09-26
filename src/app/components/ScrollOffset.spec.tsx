import { Element, HTMLElement } from '@openstax/types/lib.dom';
import { reactAndFriends, resetModules } from '../../test/utils';
import { assertDocument, assertWindow } from '../utils';

const scroll = () => {
  assertDocument().dispatchEvent(
    new (assertWindow() as any).Event('scroll', {bubbles: true})
  );
};

const click = (target: HTMLElement | Element) => {
  assertWindow().location.hash = target.getAttribute('href') || '';
  target.dispatchEvent(
    new (assertWindow() as any).Event('click', {bubbles: true})
  );
};

describe('ScrollOffset', () => {
  let React: ReturnType<typeof reactAndFriends>['React']; // tslint:disable-line:variable-name
  let renderer: ReturnType<typeof reactAndFriends>['renderer'];
  let renderToDom: ReturnType<typeof reactAndFriends>['renderToDom'];
  let ReactDOM: ReturnType<typeof reactAndFriends>['ReactDOM']; // tslint:disable-line:variable-name
  let ScrollOffset = require('./ScrollOffset').default; // tslint:disable-line:variable-name

  const render = (props?: {desktopOffset?: number, mobileOffset?: number}) => <div>
    <ScrollOffset desktopOffset={10} mobileOffset={5} {...props} />
    <a href='#somehash' data-testid='hash-link'>hash link</a>
    <a href='#somefakehash' data-testid='bad-hash-link'>hash link</a>
    <a href='/url' data-testid='non-hash-link'>non-hash link</a>

    <h1 id='somehash'>heading</h1>
  </div>;

  describe('in browswer', () => {
    let addEventListener: jest.SpyInstance;
    let removeEventListener: jest.SpyInstance;
    let container: HTMLElement;

    beforeEach(() => {
      resetModules();
      ({React, renderer, ReactDOM, renderToDom} = reactAndFriends());
      ScrollOffset = require('./ScrollOffset').default;
      addEventListener = jest.spyOn(assertWindow(), 'addEventListener');
      removeEventListener = jest.spyOn(assertWindow(), 'removeEventListener');

      const { root } = renderToDom(render());
      container = root;
    });

    afterEach(() => {
      addEventListener.mockRestore();
      removeEventListener.mockRestore();
    });

    it('mounts, updates, and unmounts', () => {
      const element = renderer.create(render());
      expect(() => element.update(render({mobileOffset: 40}))).not.toThrow();
      expect(() => element.unmount()).not.toThrow();
    });
    it('removes listener when it unmounts', () => {
      ReactDOM.unmountComponentAtNode(container);

      expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
      expect(removeEventListener).toHaveBeenCalledWith('resize', expect.anything());
    });

    it('noops when clicking link to unknown element', () => {
      const link = container.querySelector('[data-testid="bad-hash-link"]');

      if (!link) {
        return expect(link).toBeTruthy();
      }

      assertDocument().body.appendChild(container);

      click(link);
      scroll();

      expect(assertWindow().scrollBy).not.toHaveBeenCalled();
    });

    it('handles hashchange', () => {
      const window = assertWindow();
      window.dispatchEvent(new (window as any).Event('hashchange', {bubbles: true}));
      expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    });

    describe('when clicking a hash link', () => {
      let hashLink: HTMLElement;
      let getElementById: jest.SpyInstance;

      beforeEach(() => {
        const link: HTMLElement | null = container.querySelector('[data-testid="hash-link"]');

        if (!link) {
          return expect(link).toBeTruthy();
        }

        hashLink = link;

        getElementById = jest.spyOn(assertDocument(), 'getElementById');
        getElementById.mockReturnValue(hashLink);

        assertDocument().body.appendChild(container);
      });

      afterEach(() => {
        getElementById.mockRestore();
      });

      it('starts watching for scroll', async() => {
        click(hashLink);
        expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('unbinds after one scroll event', async() => {
        click(hashLink);
        expect(removeEventListener).not.toHaveBeenCalledWith('scroll', expect.anything());
        scroll();
        expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('corrects scroll when the selected element is in the bad position', async() => {
        hashLink.getBoundingClientRect = jest.fn().mockReturnValue({top: 0});

        assertWindow().matchMedia = jest.fn().mockReturnValue({matches: false});
        click(hashLink);
        scroll();
        expect(assertWindow().scrollBy).toHaveBeenCalledWith(0, -100);

        assertWindow().matchMedia = jest.fn().mockReturnValue({matches: true});
        click(hashLink);
        scroll();
        expect(assertWindow().scrollBy).toHaveBeenCalledWith(0, -50);
      });

      it('doesn\'t correct scroll when the selected element is in the good position', async() => {
        hashLink.getBoundingClientRect = jest.fn().mockReturnValue({top: 100});
        assertWindow().matchMedia = jest.fn().mockReturnValue({matches: false});
        click(hashLink);
        scroll();

        hashLink.getBoundingClientRect = jest.fn().mockReturnValue({top: 50});
        assertWindow().matchMedia = jest.fn().mockReturnValue({matches: true});
        click(hashLink);
        scroll();

        expect(assertWindow().scrollBy).not.toHaveBeenCalled();
      });
    });

    it('ignores clicking non-hash links', () => {
      addEventListener.mockReset();
      const link = container.querySelector('[data-testid="non-hash-link"]');

      if (!link) {
        return expect(link).toBeTruthy();
      }

      assertDocument().body.appendChild(container);

      link.dispatchEvent(
        new (assertWindow() as any).Event('click', {bubbles: true})
      );

      expect(addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('outside of browser', () => {
    const documentBack = document;
    const windowBack = window;

    beforeEach(() => {
      delete (global as any).document;
      delete (global as any).window;
      resetModules();
      ({React, renderer, ReactDOM, renderToDom} = reactAndFriends());
      const styled = require('styled-components');
      // this is broken when unmounting without a dom
      styled.createGlobalStyle = () => () => null;
      ScrollOffset = require('./ScrollOffset').default;
    });

    afterEach(() => {
      (global as any).document = documentBack;
      (global as any).window = windowBack;
    });

    it('mounts, updates, and unmounts', () => {
      const element = renderer.create(render());
      expect(() => element.update(render({mobileOffset: 40}))).not.toThrow();
      expect(() => element.unmount()).not.toThrow();
    });
  });

});
