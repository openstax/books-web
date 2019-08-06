import FontCollector from './FontCollector';

describe('FontCollector', () => {
  let collector: FontCollector;

  beforeEach(() => {
    collector = new FontCollector();
  });

  it('adds fonts', () => {
    collector.add('foobar');
    expect(collector.fonts).toContain('foobar');
  });

  it('calls handler for fonts added after the handler', () => {
    const handler = jest.fn();
    collector.handle(handler);
    collector.add('foobar');
    expect(handler).toHaveBeenCalledWith('foobar');
  });

  it('calls handler for fonts added before the handler', () => {
    const handler = jest.fn();
    collector.add('foobar');
    collector.handle(handler);
    expect(handler).toHaveBeenCalledWith('foobar');
  });
});
