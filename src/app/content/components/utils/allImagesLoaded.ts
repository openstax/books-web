import { Element } from '@openstax/types/lib.dom';

export default (container: Element) => {
  return Promise.all(Array.from(container.querySelectorAll('img')).map((img) => img.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    })
  )).then((): void => undefined);
};
