import { HTMLButtonElement, HTMLElement } from '@openstax/types/lib.dom';
import { IntlShape } from 'react-intl';
import { assertDefined, assertNotNull } from '../../../utils';

// from https://github.com/openstax/webview/blob/f95b1d0696a70f0b61d83a85c173102e248354cd
// .../src/scripts/modules/media/body/body.coffee#L123
export const transformContent = (rootEl: HTMLElement, intl: IntlShape) => {
  addScopeToTables(rootEl);
  wrapElements(rootEl);
  tweakFigures(rootEl);
  fixLists(rootEl);
  wrapSolutions(rootEl, intl);
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
function wrapElements(rootEl: HTMLElement) {
  rootEl.querySelectorAll(`.example, .exercise, .note, .abstract,
    [data-type="example"], [data-type="exercise"],
    [data-type="note"], [data-type="abstract"]`).forEach((el) => {

    // JSDOM does not support `:scope` in .querySelectorAll() so use .matches()
    const titles = Array.from(el.children).filter((child) => child.matches('.title, [data-type="title"], .os-title'));

    const bodyWrap = assertDefined(document, 'document should be defined').createElement('section');
    bodyWrap.append(...Array.from(el.childNodes));

    const titleWrap = assertDefined(document, 'document should be defined').createElement('header');
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
    const contents = el.innerHTML;
    el.innerHTML = `
      <div class="ui-toggle-wrapper">
        <button class="btn-link ui-toggle" title="${title}"></button>
      </div>
      <section class="ui-body" role="alert">${contents}</section>
    `;
  });
}
