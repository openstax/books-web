import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import { scrollIntoView } from '../../../../domUtils';

export default (highlight: Highlight, cardRef?: React.RefObject<HTMLElement>) => {
  const firstElement = highlight.elements[0] as HTMLElement;
  const lastElement = highlight.elements[highlight.elements.length - 1] as HTMLElement;
  const otherElements = [lastElement];
  if (cardRef?.current) {
    otherElements.push(cardRef.current);
  }
  scrollIntoView(firstElement, otherElements);
};
