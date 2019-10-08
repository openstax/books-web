import React from 'react';
import renderer from 'react-test-renderer';
import Sentry from '../../../helpers/Sentry';
import MessageProvider from '../../MessageProvider';
import ErrorBoundary from './ErrorBoundary';

jest.mock('../../../helpers/Sentry', () => ({
  captureException: jest.fn(),
}));

// tslint:disable-next-line:variable-name
const Buggy: React.SFC = () => {
  throw new Error('this is a bug');
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation((msg) => msg);
  });
  afterEach(() => {
    consoleError.mockRestore();
  });

  it('matches snapshot', () => {
    const tree = renderer
      .create(<MessageProvider><ErrorBoundary><Buggy /></ErrorBoundary></MessageProvider>)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/error occurred in the <Buggy> component/)
    );
    expect(Sentry.captureException).toHaveBeenCalled();
  });
});
