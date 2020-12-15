import Sentry from '../../../../helpers/Sentry';
import { AppServices, MiddlewareAPI } from '../../../types';
import { receiveBuyPrintConfig } from '../../actions';
import * as selectContent from '../../selectors';

const loadBuyPrintConfig = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, buyPrintConfigLoader} = services;

  const state = getState();
  const book = selectContent.book(state);

  if (!book || !('slug' in book) || !book.slug) {
    return;
  }

  const response = await buyPrintConfigLoader.load(book)
    .catch(() => null);

  if (response === null) {
    Sentry.captureException(new Error(`book: ${book.slug} had no response from buy-book config service`));
    return;
  }

  const config = response.buy_urls[0];

  if (!config) {
    return;
  }

  dispatch(receiveBuyPrintConfig(config));
};

export default loadBuyPrintConfig;
