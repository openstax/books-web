/*
 * mostly copied from https://github.com/javan/details-element-polyfill/blob/master/src/support.js
 * to ensure that we actually need to polyfill before bothering to load this.
 *
 * the polyfill library explodes when running in nodejs, otherwise we'd just bundle it.
 */

const shouldPolyfill = () => {
  if (typeof(document) === 'undefined') {
    return false;
  }
  if (typeof(window) === 'undefined') {
    return false;
  }

  const HTMLDetailsElement = window.HTMLDetailsElement;
  const element = document.createElement('details');
  const elementIsNative = typeof(HTMLDetailsElement) !== 'undefined' && element instanceof HTMLDetailsElement;

  const supportsOpen = 'open' in element || elementIsNative;
  const suppportsToggle = 'ontoggle' in element;

  return !supportsOpen || !suppportsToggle;
};

if (shouldPolyfill()) {
  import(/* webpackChunkName: "details-element-polyfill" */ 'details-element-polyfill');
}

export default undefined;
