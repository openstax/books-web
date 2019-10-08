import googleAnalyticsClient from '../../gateways/googleAnalyticsClient';
import { assertWindow } from '../utils';
import { Book } from './types';

export const print = (book: Book | undefined, currentPath: string | undefined) => {
  const window: Window = assertWindow();
  window.print();

  (currentPath && book) ?  googleAnalyticsClient.trackEvent('REX print', book.slug, currentPath)
    : googleAnalyticsClient.trackEvent('REX print', 'unknown');
};
