import { GoogleAnalyticsClient } from '../../../gateways/googleAnalyticsClient';
import googleAnalyticsClient from '../../../gateways/googleAnalyticsClient';
import { receiveLoggedOut } from '../actions';
import { untrackUserHookBody } from './untrackUser';

declare const window: Window;

describe('trackUser', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any;

  beforeEach(() => {
    client = googleAnalyticsClient;
    mockGa = jest.fn<UniversalAnalytics.ga, []>();
    window.ga = mockGa;
    client.setTrackingIds(['foo']);
  });

  it('stops tracking the user', async() => {
    const helpers: any = undefined; // unused by hook

    await (untrackUserHookBody(helpers))(receiveLoggedOut());

    expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userId', undefined);
  });
});
