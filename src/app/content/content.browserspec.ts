/** @jest-environment puppeteer */
import { finishRender, navigate, page } from '../../test/browserutils';

describe('content', () => {
  beforeEach(async() => {
    await navigate(page, '/books/Ax2o07Ul/pages/M_qlK4M9');
    await finishRender(page);
  });

  it('looks right', async() => {
    jest.setTimeout(10000);
    const screen = await page.screenshot({fullPage: true});
    (expect(screen).toMatchImageSnapshot as any)({
      failureThreshold: 2,
      failureThresholdType: 'percent',
      updatePassedSnapshot: true,
    });
  });
});
