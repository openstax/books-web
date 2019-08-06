import { MiddlewareAPI } from '../types';
import stackTraceMiddleware from './stackTraceMiddleware';

const mockStackTrace = ['unused', 'parts', 'mock', 'stack', 'trace'];
jest.mock('stacktrace-js', () => ({
  get: () => new Promise((resolve) => resolve(mockStackTrace)),
}));

describe('stackTraceMiddleware', () => {
  it('adds trace to actions in the browser', async() => {
    const next = jest.fn();
    const middlewareApi = {} as MiddlewareAPI;
    const middleware = stackTraceMiddleware(middlewareApi)(next);
    const action = {type: 'type', payload: {}};

    await middleware({...action});

    expect(next).toHaveBeenCalledWith({
      ...action,
      trace: ['mock', 'stack', 'trace'],
    });
  });

  describe('outside the browser', () => {
    const windowBackup = window;

    beforeEach(() => {
      delete (global as any).window;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
    });

    it('doesnt add trace, isnt async', () => {
      const next = jest.fn();
      const middlewareApi = {} as MiddlewareAPI;
      const middleware = stackTraceMiddleware(middlewareApi)(next);
      const action = {type: 'type', payload: {}};

      middleware({...action});

      expect(next).toHaveBeenCalledWith({
        ...action,
      });
    });
  });
});
