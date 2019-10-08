import { HTMLElement } from '@openstax/types/lib.dom';
import {
  expandCurrentChapter, scrollSidebarSectionIntoView,
} from './domUtils';

describe('scrollSidebarSectionIntoView', () => {
  let activeSection: HTMLElement;
  let activeChapter: HTMLElement;
  let sidebar: HTMLElement;

  beforeEach(() => {
    if (!document) {
      throw new Error('jsdom...');
    }
    activeSection = document.createElement('li');
    activeChapter = document.createElement('li');
    sidebar = document.createElement('div');

    Object.defineProperty(sidebar, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(sidebar, 'offsetHeight', {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(sidebar, 'scrollHeight', {
      value: 5000,
      writable: true,
    });
  });

  it('does nothing if activeSection is undefined', () => {
    scrollSidebarSectionIntoView(sidebar, null);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('does nothing if sidebar is undefined', () => {
    expect(() =>
      scrollSidebarSectionIntoView(null, activeSection)
    ).not.toThrow();
  });

  it('does nothing if section is already visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', { value: 500 });
    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(0);
  });

  it('udpates scroll position if the section is not visible', () => {
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });

  it('udpates scroll position to the chapter heading if its available and it fits', () => {
    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: activeChapter,
    });

    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('udpates scroll position to the section heading if the chapter is too long', () => {
    Object.defineProperty(activeChapter, 'offsetTop', { value: 1000 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 2500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: activeChapter,
    });

    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(2500);
  });

  it('scrolls a child element if the sidebar element is not scrollable', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    randoElement1.appendChild(sidebar);

    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    scrollSidebarSectionIntoView(randoElement1, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });

  it('searches through multiple levels to find the chapter', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: randoElement2,
    });
    Object.defineProperty(randoElement2, 'parentElement', {
      value: randoElement1,
    });
    Object.defineProperty(randoElement1, 'parentElement', {
      value: activeChapter,
    });

    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1400);
  });

  it('stops searching when it finds the sidebar', () => {
    if (!document) {
      throw new Error('jsdom...');
    }
    const randoElement1 = document.createElement('div');
    const randoElement2 = document.createElement('div');

    Object.defineProperty(activeChapter, 'offsetTop', { value: 1400 });
    Object.defineProperty(activeSection, 'offsetTop', { value: 1500 });
    Object.defineProperty(activeSection, 'parentElement', {
      value: randoElement2,
    });
    Object.defineProperty(randoElement2, 'parentElement', {
      value: randoElement1,
    });
    Object.defineProperty(randoElement1, 'parentElement', { value: sidebar });
    Object.defineProperty(sidebar, 'parentElement', { value: activeChapter });

    scrollSidebarSectionIntoView(sidebar, activeSection);
    expect(sidebar.scrollTop).toBe(1500);
  });
});

describe('expandCurrentChapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    if (!document) {
      throw new Error('jsdom...');
    }

    container = document.createElement('div');
  });

  it('expands details element', () => {
    container.innerHTML = `
      <details data-testid="details">
        <div data-testid="target" />
      </details>
    `;

    const target: HTMLElement | null = container.querySelector('[data-testid="target"]');
    const details: HTMLElement | null = container.querySelector('[data-testid="details"]');
    if ( !target ) { return expect(target).toBeTruthy(); }
    if ( !details ) { return expect(details).toBeTruthy(); }

    expect(details.getAttribute('open')).toBe(null);
    expandCurrentChapter(target);
    expect(details.getAttribute('open')).toBe('');
  });

  it('expands nested details element', () => {
    container.innerHTML = `
      <details data-testid="details1">
        <details data-testid="details2">
          <div data-testid="target" />
        </details>
      </details>
    `;

    const target: HTMLElement | null = container.querySelector('[data-testid="target"]');
    const details1: HTMLElement | null = container.querySelector('[data-testid="details1"]');
    const details2: HTMLElement | null = container.querySelector('[data-testid="details2"]');
    if ( !target ) { return expect(target).toBeTruthy(); }
    if ( !details1 ) { return expect(details1).toBeTruthy(); }
    if ( !details2 ) { return expect(details2).toBeTruthy(); }

    expect(details1.getAttribute('open')).toBe(null);
    expect(details2.getAttribute('open')).toBe(null);
    expandCurrentChapter(target);
    expect(details1.getAttribute('open')).toBe('');
    expect(details2.getAttribute('open')).toBe('');
  });

  it('stops when it reaches the toc', () => {
    container.innerHTML = `
      <details data-testid="details1">
        <div aria-label="Table of Contents">
          <details data-testid="details2">
            <div data-testid="target" />
          </details>
        </div>
      </details>
    `;

    const target: HTMLElement | null = container.querySelector('[data-testid="target"]');
    const details1: HTMLElement | null = container.querySelector('[data-testid="details1"]');
    const details2: HTMLElement | null = container.querySelector('[data-testid="details2"]');
    if ( !target ) { return expect(target).toBeTruthy(); }
    if ( !details1 ) { return expect(details1).toBeTruthy(); }
    if ( !details2 ) { return expect(details2).toBeTruthy(); }

    expect(details1.getAttribute('open')).toBe(null);
    expect(details2.getAttribute('open')).toBe(null);
    expandCurrentChapter(target);
    expect(details1.getAttribute('open')).toBe(null);
    expect(details2.getAttribute('open')).toBe('');
  });

  it('doesn’t set open attribute if is is already set', () => {
    container.innerHTML = `
      <details data-testid="details" open>
        <div data-testid="target" />
      </details>
    `;

    const target: HTMLElement | null = container.querySelector('[data-testid="target"]');
    const details: HTMLElement | null = container.querySelector('[data-testid="details"]');
    if ( !target ) { return expect(target).toBeTruthy(); }
    if ( !details ) { return expect(details).toBeTruthy(); }

    details.setAttribute = jest.fn();
    expandCurrentChapter(target);
    expect(details.setAttribute).not.toBeCalled();
  });

  it('doesn’t set open attribute on non DETAILS elements', () => {
    container.innerHTML = `
      <details data-testid="details" open>
        <div data-testid="randomParent">
          <div data-testid="target" />
        </div>
      </details>
    `;

    const target: HTMLElement | null = container.querySelector('[data-testid="target"]');
    const details: HTMLElement | null = container.querySelector('[data-testid="details"]');
    const randomParent: HTMLElement | null = container.querySelector('[data-testid="randomParent"]');

    if ( !target ) { return expect(target).toBeTruthy(); }
    if ( !details ) { return expect(details).toBeTruthy(); }
    if ( !randomParent ) { return expect(randomParent).toBeTruthy(); }

    randomParent.setAttribute = jest.fn();
    expandCurrentChapter(target);
    expect(randomParent.setAttribute).not.toBeCalled();
  });

});
