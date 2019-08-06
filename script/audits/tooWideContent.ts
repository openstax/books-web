import * as dom from '@openstax/types/lib.dom';
import { Audit } from '../domVisitor';

const tooWideContent: Audit = () => {
  // Note: This executes in the browser context
  if (!document) {
    throw new Error(`BUG: Should run in browser context`);
  }
  function nearestId(el: dom.Element): string {
    const id = el.getAttribute('id');
    if (id) {
      return id;
    } else if (el.parentElement) {
      return nearestId(el.parentElement);
    }
    throw new Error('BUG: Could not find an ancestor with an id');
  }

  // Remove all the MJX_Assistive_MathML elements because they
  // can be wider even though they are not visible
  document.querySelectorAll('.MJX_Assistive_MathML').forEach((el) => el.remove());

  const wideIds = new Set<string>();
  const root = document.querySelector('#main-content > div');
  if (!root) {
    throw new Error(`BUG: Could not find content root`);
  }
  const rootRight = root.getBoundingClientRect().right;
  root.querySelectorAll('*').forEach((c) => {
    if (c.getBoundingClientRect().right > rootRight) {
      wideIds.add(nearestId(c));
    }
  });
  return Array.from(wideIds);
};

export default tooWideContent;
