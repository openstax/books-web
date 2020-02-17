import { GetHighlightsSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { user } from '../../../auth/selectors';
import { AppServices, MiddlewareAPI } from '../../../types';
import { bookAndPage } from '../../selectors';
import { receiveHighlights } from '../actions';
import * as select from '../selectors';
import { makeApiCallOrThrow } from '../../../utils';

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, highlightClient} = services;
  const state = getState();
  const {book, page} = bookAndPage(state);
  const authenticated = user(state);
  const loaded = select.highlightsLoaded(state);

  if (!authenticated || !book || !page || typeof(window) === 'undefined' || loaded) {
    return;
  }

  const highlights = await makeApiCallOrThrow(highlightClient.getHighlights({
    perPage: 100,
    scopeId: book.id,
    sourceIds: [page.id],
    sourceType: GetHighlightsSourceTypeEnum.OpenstaxPage,
  }));

  if (highlights.data) {
    dispatch(receiveHighlights(highlights.data));
  }
};

export default hookBody;
