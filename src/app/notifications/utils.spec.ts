import { addDays, subDays } from 'date-fns';
import * as dismissAppMessages from './dismissAppMessages';
import { shouldLoadAppMessage } from './utils';

jest.mock('./dismissAppMessages');

const isAppMessageDismissed = jest.spyOn(dismissAppMessages, 'isAppMessageDismissed');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('shouldLoadAppMessage', () => {
  it('blocks messages with start_at in the future', () => {
    expect(shouldLoadAppMessage({
      dismissable: false,
      end_at: null,
      html: 'asdf',
      id: '1',
      start_at: addDays(new Date(), 1).toISOString(),
      url_regex: null,
    })).toBe(false);
  });

  it('blocks messages with end_at in the past', () => {
    expect(shouldLoadAppMessage({
      dismissable: false,
      end_at: subDays(new Date(), 1).toISOString(),
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    })).toBe(false);
  });

  it('blocks dismissed messages', () => {
    isAppMessageDismissed.mockReturnValue(true);

    expect(shouldLoadAppMessage({
      dismissable: false,
      end_at: null,
      html: 'asdf',
      id: '1',
      start_at: null,
      url_regex: null,
    })).toBe(false);
  });

  it('allows messages', () => {
    isAppMessageDismissed.mockReturnValue(false);
    expect(shouldLoadAppMessage({
      dismissable: false,
      end_at: addDays(new Date(), 1).toISOString(),
      html: 'asdf',
      id: '1',
      start_at: subDays(new Date(), 1).toISOString(),
      url_regex: null,
    })).toBe(true);
  });
});
