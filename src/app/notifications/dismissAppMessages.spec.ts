import { addDays } from 'date-fns';
import * as Cookies from 'js-cookie';
import { dismissAppMessage, isAppMessageDismissed } from './dismissAppMessages';

jest.mock('js-cookie');

describe('dismissAppMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets cookie that expires at end_at date', () => {
    const set = jest.spyOn(Cookies, 'set');

    dismissAppMessage({
      dismissable: false,
      end_at: addDays(new Date(), 1).toISOString(),
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    });

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(expect.anything(), expect.anything(), {expires: 1});
  });

  it('sets cookie that expires in 60 days if there is no end_dat', () => {
    const set = jest.spyOn(Cookies, 'set');

    dismissAppMessage({
      dismissable: false,
      end_at: null,
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    });

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(expect.anything(), expect.anything(), {expires: 60});
  });

  it('uses the same key to get and set cookies', () => {
    const set = jest.spyOn(Cookies, 'set');
    const get = jest.spyOn(Cookies, 'get');

    const message = {
      dismissable: false,
      end_at: null,
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    };

    dismissAppMessage(message);
    isAppMessageDismissed(message);

    // @ts-ignore
    expect(get.mock.calls[0][0]).toBeTruthy();
    // @ts-ignore
    expect(set.mock.calls[0][0]).toEqual(get.mock.calls[0][0]);
  });
});
