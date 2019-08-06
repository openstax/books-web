import { Element } from '@openstax/types/lib.dom';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/fp/isEmpty';
import memoize from 'lodash/fp/memoize';
import WeakMap from 'weak-map';
import { assertWindow } from '../app/utils';

const MATH_MARKER_BLOCK  = '\u200c\u200c\u200c'; // zero-width non-joiner
const MATH_MARKER_INLINE = '\u200b\u200b\u200b'; // zero-width space

const MATH_RENDERED_CLASS = 'math-rendered';
const MATH_DATA_SELECTOR = `[data-math]:not(.${MATH_RENDERED_CLASS})`;
const MATH_ML_SELECTOR   = `math:not(.${MATH_RENDERED_CLASS})`;
const COMBINED_MATH_SELECTOR = `${MATH_DATA_SELECTOR}, ${MATH_ML_SELECTOR}`;
const MATHJAX_CONFIG = {
  extensions: ['[a11y]/explorer.js'],
  showProcessingMessages: false,
  skipStartupTypeset: true,
  styles: {
    '#MathJax_MSIE_Frame': {
      left: '', right: 0, visibility: 'hidden',
    },
    '#MathJax_Message': {
      left: '', right: 0, visibility: 'hidden',
    },
  },
  tex2jax: {
    displayMath: [[MATH_MARKER_BLOCK, MATH_MARKER_BLOCK]],
    inlineMath:  [[MATH_MARKER_INLINE, MATH_MARKER_INLINE]],
  },
};

const findLatexNodes = (root: Element): Element[] => {
  const latexNodes: Element[] = [];
  for (const node of Array.from(root.querySelectorAll(MATH_DATA_SELECTOR))) {
    const formula = node.getAttribute('data-math');
    // divs should be rendered as a block, others inline
    if (node.tagName.toLowerCase() === 'div') {
      node.textContent = `${MATH_MARKER_BLOCK}${formula}${MATH_MARKER_BLOCK}`;
    } else {
      node.textContent = `${MATH_MARKER_INLINE}${formula}${MATH_MARKER_INLINE}`;
    }
    latexNodes.push(node);
  }

  return latexNodes;
};

const typesetLatexNodes = (latexNodes: Element[], windowImpl: Window) => () => {
  if (isEmpty(latexNodes)) {
    return;
  }

  windowImpl.MathJax.Hub.Queue(
    () => windowImpl.MathJax.Hub.Typeset(latexNodes),
    markLatexNodesRendered(latexNodes)
  );
};

const typesetMathMLNodes = (root: Element, windowImpl: Window) => () => {
  const mathMLNodes = Array.from(root.querySelectorAll(MATH_ML_SELECTOR));

  if (isEmpty(mathMLNodes)) {
    return;
  }

  // style the entire document because mathjax is unable to style individual math elements
  windowImpl.MathJax.Hub.Queue(
    () => windowImpl.MathJax.Hub.Typeset(root)
  );
};

const markLatexNodesRendered = (latexNodes: Element[]) => () => {
  // Queue a call to mark the found nodes as rendered so are ignored if typesetting is called repeatedly
  // uses className += instead of classList because IE
  const result = [];
  for (const node of latexNodes) {
    result.push(node.className += ` ${MATH_RENDERED_CLASS}`);
  }
};

// Search document for math and [data-math] elements and then typeset them
function typesetDocument(root: Element, windowImpl: Window) {
  const latexNodes = findLatexNodes(root);

  windowImpl.MathJax.Hub.Queue(
    typesetLatexNodes(latexNodes, windowImpl),
    typesetMathMLNodes(root, windowImpl)
  );
}

const typesetDocumentPromise = (root: Element, windowImpl: Window): Promise<void> => new Promise((resolve) => {
  typesetDocument(root, windowImpl);
  windowImpl.MathJax.Hub.Queue(resolve);
});

// memoize'd getter for typeset document function so that each node's
// typeset has its own debounce
const getTypesetDocument = memoize((root, windowImpl) => {
  // Install a debounce around typesetting function so that it will only run once
  // every Xms even if called multiple times in that period
  return debounce(typesetDocumentPromise, 100, {
    leading: true,
    trailing: false,
  }).bind(null, root, windowImpl);
});
getTypesetDocument.cache = new WeakMap();

// typesetMath is the main exported function.
// It's called by components like HTML after they're rendered
const typesetMath = (root: Element, windowImpl = window) => {
  // schedule a Mathjax pass if there is at least one [data-math] or <math> element present
  if (windowImpl && windowImpl.MathJax && windowImpl.MathJax.Hub && root.querySelector(COMBINED_MATH_SELECTOR)) {
    return getTypesetDocument(root, windowImpl)();
  }

  return Promise.resolve();
};

// The following should be called once and configures MathJax.
// Assumes the script to load MathJax is of the form:
// `...MathJax.js?config=TeX-MML-AM_HTMLorMML-full&amp;delayStartupUntil=configured`
function startMathJax() {
  const window = assertWindow();
  const configuredCallback = () => window.MathJax.Hub.Configured();

  if (window.MathJax && window.MathJax.Hub) {
    window.MathJax.Hub.Config(MATHJAX_CONFIG);
    // Does not seem to work when passed to Config
    window.MathJax.Hub.processSectionDelay = 0;
    return configuredCallback();
  } else {
    // If the MathJax.js file has not loaded yet:
    // Call MathJax.Configured once MathJax loads and
    // loads this config JSON since the CDN URL
    // says to `delayStartupUntil=configured`
    (MATHJAX_CONFIG as any).AuthorInit = configuredCallback;
    return window.MathJax = MATHJAX_CONFIG;
  }
}

export {
  typesetMath,
  startMathJax,
};
