import { Document, HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import { isHtmlElementWithHighlight } from '../../../guards';
import { push } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { AppServices, AppState, Dispatch } from '../../../types';
import { assertNotNull, assertWindow, memoizeStateToProps } from '../../../utils';
import { hasOSWebData, isPageReferenceError } from '../../guards';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import { focused, hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../../highlights/selectors';
import { content } from '../../routes';
import * as select from '../../selectors';
import { Book, PageReferenceError, PageReferenceMap } from '../../types';
import { isClickWithModifierKeys } from '../../utils/domUtils';
import { getBookPageUrlAndParams, toRelativeUrl } from '../../utils/urlUtils';

export const mapStateToContentLinkProp = memoizeStateToProps((state: AppState) => ({
  book: select.book(state),
  currentPath: selectNavigation.pathname(state),
  focusedHighlight: focused(state),
  hasUnsavedHighlight: hasUnsavedHighlightSelector(state),
  locationState: selectNavigation.locationState(state),
  page: select.page(state),
  references: select.contentReferences(state),
}));
export const mapDispatchToContentLinkProp = (dispatch: Dispatch) => ({
  navigate: flow(push, dispatch),
});
export type ContentLinkProp =
  ReturnType<typeof mapStateToContentLinkProp> & ReturnType<typeof mapDispatchToContentLinkProp>;

const reducePageReferenceError = (reference: PageReferenceError, document: Document) => {
  const a = assertNotNull(
    document.querySelector(`[href^='${reference.match}']`),
    'references are created from hrefs');
  a.removeAttribute('href');
  a.setAttribute('onclick', 'alert("This link is broken because of a cross book content loading issue")');
};

// tslint:disable-next-line: max-line-length
const reduceReference = (reference: PageReferenceMap, currentPath: string, document: Document, systemQueryString: string) => {
  const path = content.getUrl(reference.params);
  const a = assertNotNull(
    document.querySelector(`[href^='${reference.match}']`),
    'references are created from hrefs');
  const href = assertNotNull(a.getAttribute('href'), 'it was found by href value')
    .replace(reference.match, toRelativeUrl(currentPath, path) + systemQueryString);
  a.setAttribute('href', href);
};

// tslint:disable-next-line: max-line-length
export const reduceReferences = (document: Document, {references, currentPath}: ContentLinkProp, systemQueryString: string) => {
  for (const reference of references) {
    // references may contain PageReferenceError only if UNLIMITED_CONTENT is set to true
    if (isPageReferenceError(reference)) {
      reducePageReferenceError(reference, document);
    } else {
      reduceReference(reference, currentPath, document, systemQueryString);
    }
  }
};

const isPathRefernceForBook = (pathname: string, book: Book) => (ref: PageReferenceMap | PageReferenceError) =>
  isPageReferenceError(ref)
  ? false
  : content.getUrl(ref.params) === pathname
    && (
      ('slug' in ref.params.book && hasOSWebData(book) && ref.params.book.slug === book.slug)
      || ('uuid' in ref.params.book && ref.params.book.uuid === book.id)
    );

export const contentLinkHandler = (anchor: HTMLAnchorElement, getProps: () => ContentLinkProp, services: AppServices) =>
  async(e: MouseEvent) => {
    const {
      references,
      navigate,
      book,
      page,
      currentPath,
      locationState,
      focusedHighlight,
      hasUnsavedHighlight,
    } = getProps();
    const href = anchor.getAttribute('href');

    if (!href || !book || !page || isClickWithModifierKeys(e)) {
      return;
    }

    const base = new URL(assertWindow().location.href);
    base.hash = '';
    base.search = '';

    const {hash, search, pathname} = new URL(href, base.href);
    const reference = references.find(isPathRefernceForBook(pathname, book));

    const searchString = search.substring(1);

    if (!reference && !(pathname === currentPath && hash)) {
      return;
    }

    e.preventDefault();

    if (isHtmlElementWithHighlight(e.target)) {
      if (e.target.getAttribute('data-highlight-id') !==  focusedHighlight) {
        return;
      }
      e.stopPropagation();
    }

    if (hasUnsavedHighlight && !await showConfirmation(services)) {
      return;
    }

    if (reference && !isPageReferenceError(reference)) {
      // defer to allow other handlers to execute before nav happens
      defer(() => navigate({
        params: reference.params,
        route: content,
        state: {
          ...locationState,
          ...reference.state,
        },
      }, {hash, search: searchString}));
    } else {
      // defer to allow other handlers to execute before nav happens
      defer(() => navigate({
        params: getBookPageUrlAndParams(book, page).params,
        route: content,
        state: {
          ...locationState,
          ...getBookPageUrlAndParams(book, page).state,

        },
      }, {hash, search: searchString}));
    }
  };
