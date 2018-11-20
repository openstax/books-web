import css from 'cnx-recipes/styles/output/intro-business.json';
import { routeHook } from '../../navigation/utils';
import { receiveBook, receivePage, requestBook, requestPage } from '../actions';
import { content } from '../routes';
import * as select from '../selectors';
import { archiveLoader } from '../utils';

const fontMatches = css.match(/"(https:\/\/fonts\.googleapis\.com\/css\?family=.*?)"/);
const fonts = fontMatches ? fontMatches.slice(1) : [];

export default routeHook(content, ({dispatch, getState, fontCollector}) => async({match}) => {
  const state = getState();
  const {bookId, pageId} = match.params;
  const book = select.book(state);
  const page = select.page(state);
  const promises: Array<Promise<any>> = [];

  fonts.forEach((font) => fontCollector.add(font));

  if ((!book || book.id !== bookId) && bookId !== select.loadingBook(state)) {
    dispatch(requestBook(bookId));
    promises.push(archiveLoader(bookId).then((bookData) => dispatch(receiveBook(bookData))));
  }

  if ((!page || page.id !== pageId) && pageId !== select.loadingPage(state)) {
    dispatch(requestPage(pageId));
    promises.push(archiveLoader(`${bookId}:${pageId}`)
      .then((pageData) => dispatch(receivePage(pageData)))
    );
  }

  await Promise.all(promises);
});
