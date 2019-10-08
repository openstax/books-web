import { mockRange } from '../test/mocks/rangy';
import { resetModules } from '../test/utils';
import { RangyRange } from './rangy';

let rangy: typeof import ('../test/mocks/rangy').default;

beforeEach(() => {
  resetModules();
  jest.resetAllMocks();

  rangy = require('rangy');
});

describe('rangy', () => {
  it('initializes rangy if necessary', () => {
    rangy.initialized = false;
    require('./rangy');
    expect(rangy.init).toHaveBeenCalled();
  });

  it('doesn\'t initializes rangy if unnecessary', () => {
    rangy.initialized = true;
    require('./rangy');
    expect(rangy.init).not.toHaveBeenCalled();
  });
});

describe('findTextInRange', () => {
  let findTextInRange: typeof import ('./rangy').findTextInRange;

  beforeEach(() => {
    findTextInRange = require('./rangy').findTextInRange;
  });

  it('clones every found match', () => {
    const withinRange = mockRange();
    const searchRange = mockRange();

    searchRange.findText
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    searchRange.intersectsRange.mockReturnValue(true);

    const firstMatch = mockRange();
    const secondMatch = mockRange();

    searchRange.cloneRange
      .mockReturnValue(searchRange)
      .mockReturnValueOnce(firstMatch)
      .mockReturnValueOnce(secondMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(2);
    expect(result[0]).toBe(firstMatch);
    expect(result[1]).toBe(secondMatch);
  });

  it('doesn\'t look for more matches if outside given range', () => {
    const withinRange = mockRange();
    const searchRange = mockRange();

    searchRange.findText.mockReturnValue(true);

    searchRange.intersectsRange
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
    ;

    const firstMatch = mockRange();

    searchRange.cloneRange.mockReturnValue(firstMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(1);
    expect(searchRange.findText).toHaveBeenCalledTimes(1);
  });
});
