import { GoogleAnalyticsClient } from './googleAnalyticsClient';

declare const window: Window;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('GoogleAnalyticsClient', () => {
  let client: GoogleAnalyticsClient;
  let mockGa: any; // jest.Mock<UniversalAnalytics.ga, []>;

  beforeEach(() => {
    client = new GoogleAnalyticsClient();
    mockGa = jest.fn<UniversalAnalytics.ga, []>(() => ({}));
    window.ga = mockGa;
  });

  describe('setUserId', () => {

    describe('called before tracking IDs set', () => {
      it('sets it after tracking IDs set', async() => {
        client.setUserId("jimbo");
        expect(mockGa).not.toHaveBeenCalled();
        client.setTrackingIds(["foo", "bar"]);
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userid', 'jimbo');
        expect(mockGa).toHaveBeenCalledWith('tbar.set', 'userid', 'jimbo');
      });
    });

    describe('called after tracking ID set', () => {
      it('sets it after tracking ID set', async() => {
        client.setTrackingIds(["foo"]);
        client.setUserId("jimbo");
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'userid', 'jimbo');
      });
    });

  });

  describe('trackPageView', () => {

    describe('called before tracking ID set', () => {
      it('saves the commands and sends them after tracking IDs set', async() => {
        client.trackPageView('/some/path');
        expect(mockGa).not.toHaveBeenCalled();

        let sleepMs:number = 5;
        await sleep(sleepMs);

        client.setTrackingIds(["foo"]);
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'queueTime', expect.any(Number));
        expect(mockGa.mock.calls[1][2]).toBeGreaterThanOrEqual(sleepMs);
        expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'pageview', '/some/path');
      })
    });

    describe('called after tracking IDs set', () => {
      it('sends them right away to all trackers', async() => {
        client.setTrackingIds(["foo", "bar"]);
        client.trackPageView('/some/path');
        expect(mockGa).toHaveBeenCalledWith('tfoo.set', 'queueTime', 0);
        expect(mockGa).toHaveBeenCalledWith('tfoo.send', 'pageview', '/some/path');
        expect(mockGa).toHaveBeenCalledWith('tbar.set', 'queueTime', 0);
        expect(mockGa).toHaveBeenCalledWith('tbar.send', 'pageview', '/some/path');
      });
    })

  });

  describe('setTrackingIds', () => {

    describe('first call', () => {
      it('creates trackers using the underlying ga function', async() => {
        client.setTrackingIds(["foo", "bar"]);
        expect(mockGa).toHaveBeenCalledWith('create', 'foo', 'auto', 'tfoo');
        expect(mockGa).toHaveBeenCalledWith('create', 'bar', 'auto', 'tbar');
      });
    });

    describe('second call', () => {
      beforeEach(() => {
        client.setTrackingIds(["foo", "bar"]);
        mockGa.mockClear();
      })

      it('creates trackers using the underlying ga function', async() => {
        client.setTrackingIds(["xyz"]);
        expect(mockGa).not.toHaveBeenCalled();
      });
    });

    describe('tracker name alphanumericalizing', () => {
      it('strips hyphens out of tracking IDs for tracker names', async() => {
        client.setTrackingIds(["ab--2"]);
        expect(mockGa).toHaveBeenCalledWith('create', 'ab--2', 'auto', 'tab2');
      });
    });

  });

});
