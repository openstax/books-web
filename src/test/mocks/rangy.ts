export const mockRange = (contents: string = '') => {
  const range = {
    cloneRange: jest.fn(),
    collapse: jest.fn(),
    findText: jest.fn(() => false),
    intersectsRange: jest.fn(),
    nativeRange: () => range,
    selectNodeContents: jest.fn((node) => {
      contents = node.HTMLContent || node.textContent;
    }),
    toString: () => contents,
  };
  return range;
};

export default {
  createRange: jest.fn(() => mockRange()),
  createRangyRange: jest.fn(() => mockRange()),
  init: jest.fn(),
  initialized: true,
};
