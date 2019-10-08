import { HTMLElement } from '@openstax/types/lib.dom';

if (typeof(document) !== 'undefined') {
  import(/* webpackChunkName: "Node.children" */ 'mdn-polyfills/Node.prototype.children');
}

export const findFirstScrollableChild = (element: HTMLElement | null): HTMLElement | null => {
  if (!element || element.scrollHeight > element.offsetHeight) {
    return element;
  }

  return Array.from(element.children).reduce<HTMLElement | null>(
    (result, child) => result || findFirstScrollableChild(child as HTMLElement),
    null
  );
};

export const tocSectionIsVisible = (scrollable: HTMLElement, section: HTMLElement) => {
  return section.offsetTop > scrollable.scrollTop && section.offsetTop - scrollable.scrollTop < scrollable.offsetHeight;
};

export const findParentTocSection = (container: HTMLElement, section: HTMLElement) => {
  let search = section.parentElement;
  let selectedChapter: undefined | HTMLElement;
  while (search && !selectedChapter && search !== container) {
    if (search.nodeName === 'LI') {
      selectedChapter = search;
    }
    search = search.parentElement;
  }
  return selectedChapter;
};

const determineScrollTarget = (
  scrollable: HTMLElement,
  selectedChapter: HTMLElement | undefined,
  activeSection: HTMLElement
) => {
  const chapterSectionDelta = selectedChapter && (activeSection.offsetTop - selectedChapter.offsetTop);
  return selectedChapter && chapterSectionDelta && (chapterSectionDelta < scrollable.offsetHeight)
    ? selectedChapter
    : activeSection;
};

export const scrollSidebarSectionIntoView = (sidebar: HTMLElement | null, activeSection: HTMLElement | null) => {
  const scrollable = findFirstScrollableChild(sidebar);
  if (!activeSection || !scrollable || tocSectionIsVisible(scrollable, activeSection)) {
    return;
  }

  const selectedChapter = findParentTocSection(scrollable, activeSection);
  const scrollTarget = determineScrollTarget(scrollable, selectedChapter, activeSection);

  scrollable.scrollTop = scrollTarget.offsetTop;

};

export const expandCurrentChapter = (activeSection: HTMLElement | null) => {
  let focus = activeSection;

  while (focus && focus.getAttribute('aria-label') !== 'Table of Contents') {
    if (focus.tagName === 'DETAILS' && !focus.hasAttribute('open')) {
      focus.setAttribute('open', '');
    }

    focus = focus.parentElement;
  }
};

export const setSidebarHeight = (sidebar: HTMLElement, window: Window) => {
  const scrollHandlerCallback = () => {
    const top = sidebar.getBoundingClientRect().top;
    const height = window.innerHeight;
    sidebar.style.setProperty('height', `${height - top}px`);
  };

  const animation = () => requestAnimationFrame(scrollHandlerCallback);

  window.addEventListener('scroll', animation, { passive: true });
  window.addEventListener('resize', animation, { passive: true });

  return {
    callback: scrollHandlerCallback,
    deregister: () => {
      window.removeEventListener('scroll', animation);
      window.removeEventListener('resize', animation);
    },
  };
};
