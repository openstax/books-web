import { Document, HTMLButtonElement, HTMLElement, HTMLImageElement } from '@openstax/types/lib.dom';
import { IntlShape } from 'react-intl';
import { REACT_APP_ARCHIVE_URL } from '../../../../config';
import { assertDefined, assertNotNull } from '../../../utils';

// from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
// .../src/scripts/modules/media/body/body.coffee#L123
// We are passing Document because it is required to prerender.
export const transformContent = (document: Document, rootEl: HTMLElement, intl: IntlShape) => {
  addScopeToTables(rootEl);
  wrapElements(document, rootEl);
  tweakFigures(rootEl);
  fixLists(rootEl);
  wrapSolutions(rootEl, intl);
  prefixResources(rootEl);
  moveFootnotes(document, rootEl, intl);
};

const toggleSolutionAttributes = (solution: HTMLElement, intl: IntlShape) => {
  if (solution.classList.contains('ui-solution-visible')) {
    solution.classList.remove('ui-solution-visible');
    solution.removeAttribute('aria-expanded');
    solution.setAttribute('aria-label', intl.formatMessage({id: 'i18n:content:solution:show'}));
  } else {
    solution.className += ' ui-solution-visible';
    solution.setAttribute('aria-expanded', '');
    solution.setAttribute('aria-label', intl.formatMessage({id: 'i18n:content:solution:hide'}));
  }
};

export const toggleSolution = (button: HTMLElement, intl: IntlShape) => () => {
  if (!button.parentElement || !button.parentElement.parentElement) {
    return;
  }
  toggleSolutionAttributes(button.parentElement.parentElement, intl);
};

export const mapSolutions = (container: HTMLElement | null, cb: (a: HTMLButtonElement) => void) => {
  if (container) {
    Array.from(container.querySelectorAll<HTMLButtonElement>(
      '[data-type="solution"] > .ui-toggle-wrapper > .ui-toggle, .solution > .ui-toggle-wrapper > .ui-toggle'
    )).forEach(cb);
  }
};

function addScopeToTables(rootEl: HTMLElement) {
  rootEl.querySelectorAll('table th').forEach((el) => el.setAttribute('scope', 'col'));
}

// Wrap title and content elements in header and section elements, respectively
function wrapElements(document: Document, rootEl: HTMLElement) {
  rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
    [data-type="example"], [data-type="exercise"],
    [data-type="note"], [data-type="abstract"]`).forEach((el) => {

    // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
    const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

    const bodyWrap = document.createElement('section');
    bodyWrap.append(...Array.from(el.childNodes));

    const titleWrap = document.createElement('header');
    titleWrap.append(...titles);

    el.append(titleWrap, bodyWrap);

    // Add an attribute for the parents' `data-label`
    // since CSS does not support `parent(attr(data-label))`.
    // When the title exists, this attribute is added before it
    const label = el.getAttribute('data-label');
    if (label) {
      titles.forEach((title) => title.setAttribute('data-label-parent', label));
    }

    // Add a class for styling since CSS does not support `:has(> .title)`
    // NOTE: `.toggleClass()` explicitly requires a `false` (not falsy) 2nd argument
    if (titles.length > 0) {
      el.classList.add('ui-has-child-title');
    }
  });
}

function tweakFigures(rootEl: HTMLElement) {
  // move caption to bottom of figure
  rootEl.querySelectorAll('figure > figcaption').forEach((el) => {
    const parent = assertNotNull(el.parentElement, 'figcaption parent should always be defined');
    parent.classList.add('ui-has-child-figcaption');
    parent.appendChild(el);
  });
}

function fixLists(rootEl: HTMLElement) {
  // Copy data-mark-prefix and -suffix from ol to li so they can be used in css
  rootEl.querySelectorAll(`ol[data-mark-prefix] > li, ol[data-mark-suffix] > li,
  [data-type="list"][data-list-type="enumerated"][data-mark-prefix] > [data-type="item"],
  [data-type="list"][data-list-type="enumerated"][data-mark-suffix] > [data-type="item"]`).forEach((el) => {
    const parent = assertNotNull(el.parentElement, 'list parent should always be defined');
    const markPrefix = parent.getAttribute('data-mark-prefix');
    const markSuffix = parent.getAttribute('data-mark-suffix');
    if (markPrefix) { el.setAttribute('data-mark-prefix', markPrefix); }
    if (markSuffix) { el.setAttribute('data-mark-suffix', markSuffix); }
  });
  rootEl.querySelectorAll('ol[start], [data-type="list"][data-list-type="enumerated"][start]').forEach((el) => {
    el.setAttribute('style', `counter-reset: list-item ${el.getAttribute('start')}`);
  });
}

function wrapSolutions(rootEl: HTMLElement, intl: IntlShape) {
  const title = intl.formatMessage({id: 'i18n:content:solution:toggle-title'});

  // Wrap solutions in a div so "Show/Hide Solutions" work
  rootEl.querySelectorAll('.exercise .solution, [data-type="exercise"] [data-type="solution"]').forEach((el) => {
    el.setAttribute('aria-label', intl.formatMessage({id: 'i18n:content:solution:show'}));
    const contents = el.innerHTML;
    el.innerHTML = `
      <div class="ui-toggle-wrapper">
        <button class="btn-link ui-toggle" title="${title}"></button>
      </div>
      <section class="ui-body" role="alert">${contents}</section>
    `;
  });
}

function prefixResources(rootEl: HTMLElement) {
  rootEl.querySelectorAll<HTMLImageElement>('img[src^="/resources/"]').forEach(
    (el) => el.src = REACT_APP_ARCHIVE_URL + el.getAttribute('src')
  );
}

function moveFootnotes(document: Document, rootEl: HTMLElement, intl: IntlShape) {
  const footnotes = document.querySelectorAll('[role=doc-footnote]');
  if (!footnotes.length) { return; }

  const title = intl.formatMessage({id: 'i18n:content:footnotes:title'});
  const header = document.createElement('h3');
  header.setAttribute('data-type', 'footnote-refs-title');
  header.innerHTML = title;

  const container = document.createElement('div');
  container.setAttribute('data-type', 'footnote-refs');
  container.appendChild(header);

  const list = document.createElement('ul');
  list.setAttribute('data-list-type', 'bulleted');
  list.setAttribute('data-bullet-style', 'none');

  for (const [counter, footnote] of Array.from(footnotes).entries()) {
    const item = document.createElement('li');
    item.setAttribute('id', assertNotNull(footnote.getAttribute('id'), 'id of footnote was not found'));
    item.setAttribute('data-type', 'footnote-ref');

    // Construct a backlink if one is not available
    // https://kb.daisy.org/publishing/docs/html/notes.html#ex-04
    if (!footnote.querySelector('a[role="doc-backlink"]')) {
      footnote.setAttribute('id', `autogen-ui-footnote-ref${counter}`);

      const backlink = document.createElement('a');
      backlink.setAttribute('role', 'doc-backlink');
      backlink.setAttribute('title', 'Go to note reference');
      backlink.setAttribute('href', `#autogen-ui-footnote-ref${counter}`);

      const blNumber = footnote.querySelector('.footnote-number, [data-type="footnote-number"]');
      const backlinkNumber = assertNotNull(assertDefined(blNumber, 'could not find footnote number'), 'could not find footnote number');
      backlink.textContent = backlinkNumber.textContent;
      backlinkNumber.remove();

      item.innerHTML = footnote.innerHTML;
      item.prepend(backlink);
    } else {
      item.innerHTML = footnote.innerHTML;
    }

    list.appendChild(item);
    footnote.remove();
  }

  container.appendChild(list);
  rootEl.appendChild(container);

  const footnoteLinks = document.querySelectorAll('[role="doc-noteref"]');
  for (const [counter, link] of Array.from(footnoteLinks).entries()) {
    if (!link.getAttribute('id')) {
      link.setAttribute('id', `autogen-ui-footnote-ref${counter}`);
    }
  }
}
