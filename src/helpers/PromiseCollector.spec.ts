import PromiseCollector from './PromiseCollector';

describe('PromiseCollector', () => {
  let collector: PromiseCollector;

  beforeEach(() => {
    collector = new PromiseCollector();
  });

  it('adds promises', () => {
    collector.add(new Promise(() => null));
    expect(collector.promises.length).toBe(1);
  });

  it('is unresolved with unresolved promises', (done) => {
    collector.add(new Promise(() => null));
    collector.add(Promise.resolve());

    let resolved = false;

    collector.calm().then(() => resolved = true);

    process.nextTick(() => {
      expect(resolved).toBe(false);
      done();
    });
  });

  it('is resolved with resolved promises', (done) => {
    collector.add(Promise.resolve());
    collector.add(Promise.resolve());

    let resolved = false;

    collector.calm().then(() => resolved = true);

    process.nextTick(() => {
      expect(resolved).toBe(true);
      done();
    });
  });

  it('removes resolved promises', (done) => {
    const p1 = new Promise(() => null);
    const p2 = Promise.resolve();
    const p3 = new Promise(() => null);
    const p4 = Promise.resolve();

    collector.add(p1);
    collector.add(p2);
    collector.add(p3);
    collector.add(p4);

    process.nextTick(() => {
      expect(collector.promises.length).toBe(2);
      expect(collector.promises[0]).toBe(p1);
      expect(collector.promises[1]).toBe(p3);
      done();
    });
  });
});
