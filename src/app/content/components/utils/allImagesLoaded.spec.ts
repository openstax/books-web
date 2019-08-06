import { assertDocument } from '../../../utils';
import allImagesLoaded from './allImagesLoaded';

describe('allImagesLoaded', () => {
  it('resolves when passed an element with no images', async() => {
    const element = assertDocument().createElement('div');
    await expect(allImagesLoaded(element)).resolves.toBeUndefined();
  });

  it('resolves when passed an image that is already loaded', async() => {
    const element = assertDocument().createElement('div');
    const img = assertDocument().createElement('img');
    element.appendChild(img);

    Object.defineProperty(img, 'complete', {
      value: true,
      writable: false,
    });

    await expect(allImagesLoaded(element)).resolves.toBeUndefined();
  });

  it('resolves once images are loaded', async() => {
    const element = assertDocument().createElement('div');
    const img = assertDocument().createElement('img');
    element.appendChild(img);

    let finished = false;
    allImagesLoaded(element).then(() => finished = true);

    if (!img.onload) {
      return expect(img.onload).toBeTruthy();
    }

    await Promise.resolve();
    expect(finished).toBe(false);

    img.onload({} as any);

    await Promise.resolve();
    expect(finished).toBe(true);
  });

  it('resolves if images error', async() => {
    const element = assertDocument().createElement('div');
    const img = assertDocument().createElement('img');
    element.appendChild(img);

    let finished = false;
    allImagesLoaded(element).then(() => finished = true);

    if (!img.onerror) {
      return expect(img.onerror).toBeTruthy();
    }

    await Promise.resolve();
    expect(finished).toBe(false);

    img.onerror({} as any);

    await Promise.resolve();
    expect(finished).toBe(true);
  });
});
