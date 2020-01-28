import { assertDocument } from '../../app/utils';
import { track } from './clickButton';

describe('clickLink', () => {
  const document = assertDocument();

  it('noops without label', () => {
    const button = document.createElement('button');
    const result = track({pathname: 'asdf'}, button);
    expect(result).toBeUndefined();
  });

  describe('google analytics', () => {

    it('reports label', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'foo');
      const result = track({pathname: 'asdf'}, button);
      if (!result) {
        return expect(result).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventAction).toEqual('foo');
    });

    it('adds region to category', () => {
      const button = document.createElement('button');
      button.setAttribute('data-analytics-region', 'foo');
      button.setAttribute('aria-label', 'foo');
      const result = track({pathname: 'asdf'}, button);
      if (!result) {
        return expect(result).toBeTruthy();
      }
      expect(result.getGoogleAnalyticsPayload().eventCategory).toEqual('REX Button (foo)');
    });
  });
});
