import * as Cookies from 'js-cookie';

const acknowledgedKey: string = 'cookie_notice_acknowledged';

export const doAcceptCookies = () => {
  Cookies.set(acknowledgedKey, 'true', {expires: 365 * 20});
};

export const isAcceptCookiesNeeded = () => {
  return Cookies.get(acknowledgedKey) !== 'true';
};

export const clearAcceptCookies = () => {
  Cookies.remove(acknowledgedKey);
};
