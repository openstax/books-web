import { GoogleAnalyticsClient } from '../../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import { AppServices, AppState, MiddlewareAPI } from '../../../types';
import { requestSearch } from '../actions';
import { trackSearchHookBody } from './trackSearch';

declare const window: Window;

describe('trackSearch', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
    client.setTrackingIds(['foo']);
  });

  it('tracks the search for a known book', async() => {
    const helpers = ({
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX search', 'a query', 'algebra');
  });

  it('tracks the search when the book is not available', async() => {
    const helpers = ({
      getState: () => ({content: {}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query'));
    expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'event', 'REX search', 'a query', 'unknown');
  });

  it('does not tracks the search for page reload', async() => {
    const helpers = ({
      getState: () => ({content: {book: {slug: 'algebra'}}} as AppState),
    } as any) as MiddlewareAPI & AppServices;

    await (trackSearchHookBody(helpers))(requestSearch('a query', {isResultReload: true}));
    expect(mockGa).not.toHaveBeenCalled();
  });
});
