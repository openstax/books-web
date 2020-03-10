import { HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import { push } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import { hasOSWebData } from '../../guards';
import showConfirmation from '../../highlights/components/utils/showConfirmation';
import { hasUnsavedHighlight as hasUnsavedHighlightSelector } from '../../highlights/selectors';
import { content } from '../../routes';
import * as select from '../../selectors';
import { Book, PageReferenceMap } from '../../types';
import { isClickWithModifierKeys } from '../../utils/domUtils';
import { getBookPageUrlAndParams, toRelativeUrl } from '../../utils/urlUtils';

export const mapStateToContentLinkProp = (state: AppState) => ({
  book: select.book(state),
  currentPath: selectNavigation.pathname(state),
  hasUnsavedHighlight: hasUnsavedHighlightSelector(state),
  locationState: selectNavigation.locationState(state),
  page: select.page(state),
  references: select.contentReferences(state),
});
export const mapDispatchToContentLinkProp = (dispatch: Dispatch) => ({
  navigate: flow(push, dispatch),
});
export type ContentLinkProp =
  ReturnType<typeof mapStateToContentLinkProp> & ReturnType<typeof mapDispatchToContentLinkProp>;

export const reduceReferences = ({references, currentPath}: ContentLinkProp) => (pageContent: string) =>
  references.reduce(
    (html, reference) => html.replace(reference.match, toRelativeUrl(currentPath, content.getUrl(reference.params))),
    pageContent
  );

const isPathRefernceForBook = (pathname: string, book: Book) => (ref: PageReferenceMap) =>
  content.getUrl(ref.params) === pathname
    && (
      ('slug' in ref.params.book && hasOSWebData(book) && ref.params.book.slug === book.slug)
      || ('uuid' in ref.params.book && ref.params.book.uuid === book.id)
    );

export const contentLinkHandler = (anchor: HTMLAnchorElement, getProps: () => ContentLinkProp) =>
  async(e: MouseEvent) => {
    const {references, navigate, book, page, locationState, currentPath, hasUnsavedHighlight} = getProps();
    const href = anchor.getAttribute('href');

    if (!href || !book || !page || isClickWithModifierKeys(e)) {
      return;
    }

    const {hash, search, pathname} = new URL(href, assertWindow().location.href);
    const reference = references.find(isPathRefernceForBook(pathname, book));

    if (!reference && !(pathname === currentPath && hash)) {
      return;
    }

    e.preventDefault();
    if (hasUnsavedHighlight && !await showConfirmation()) {
      return;
    }

    if (reference) {
      // defer to allow other handlers to execute before nav happens
      defer(() => navigate({
        params: reference.params,
        route: content,
        state: {
          ...locationState,
          ...reference.state,
        },
      }, {hash, search}));
    } else {
      // defer to allow other handlers to execute before nav happens
      defer(() => navigate({
        params: getBookPageUrlAndParams(book, page).params,
        route: content,
        state: {
          ...locationState,
          ...getBookPageUrlAndParams(book, page).state,

        },
      }, {hash, search}));
    }
  };
