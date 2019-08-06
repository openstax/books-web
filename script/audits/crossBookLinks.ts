import { Audit } from '../domVisitor';

const crossBookLinks: Audit = (): string[] => {
  // Note: This executes in the browser context
  if (!document) {
    throw new Error(`BUG: Should run in browser context`);
  }

  const root = document.querySelector('#main-content > div');
  if (!root) {
    throw new Error(`BUG: Could not find content root`);
  }
  return Array.from(root.querySelectorAll('[href^=".."]'))
    .map((element) => element.getAttribute('href'))
    .filter((attribute: string | null): attribute is string => attribute !== null);
};

export default crossBookLinks;
