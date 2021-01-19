import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';
import createMockHighlight from '../../../../test/mocks/highlight';
import attachHighlight from './attachHighlight';

jest.mock('../../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

describe('attachHighlight', () => {
  // tslint:disable-next-line: variable-name
  let HighlighterMock: Highlighter;

  beforeEach(() => {
    HighlighterMock = {
      getHighlight: () => ({
        isAttached: () => true,
      }),
      highlight: jest.fn(),
    } as unknown as Highlighter;
  });

  it('attaches highlight', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    } as unknown as Highlight;

    HighlighterMock.getHighlight = () => mockHighlight;

    const data = attachHighlight(mockHighlight, HighlighterMock);

    expect(data.highlight).toEqual(mockHighlight);
    expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockHighlight);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('attaches serialized highlight', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    } as unknown as Highlight;
    const mockSerializedHighlight = new SerializedHighlight({
      ...mockHighlight,
      type: 'TextPositionSelector',
    } as any);

    HighlighterMock.getHighlight = () => mockHighlight;

    attachHighlight(
      mockSerializedHighlight,
      HighlighterMock
    );

    expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockSerializedHighlight);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  describe('errors', () => {
    let mockHighlight: Highlight;

    beforeEach(() => {
      mockHighlight = {
        ...createMockHighlight(),
        isAttached: () => false,
      } as unknown as Highlight;

      HighlighterMock.getHighlight = () => mockHighlight;
    });

    it('call Sentry if highlight was not attached', () => {
      const data = attachHighlight(mockHighlight, HighlighterMock);

      expect(data.highlight).toEqual(null);
      expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockHighlight);
      expect(Sentry.captureException)
        .toHaveBeenCalledWith(new Error(`Highlight with id: ${mockHighlight.id} has not been attached.`));
    });

    it('accepts custom error messages', () => {
      attachHighlight(mockHighlight, HighlighterMock, (failedHighlight) =>
        `${failedHighlight.id} doesn't matter`
      );

      expect(Sentry.captureException)
        .toHaveBeenCalledWith(new Error(`${mockHighlight.id} doesn't matter`));
    });
  });
});
