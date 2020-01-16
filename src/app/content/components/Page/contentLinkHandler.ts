import { HTMLAnchorElement, MouseEvent } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import flow from 'lodash/fp/flow';
import { push } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import { hasOSWebData } from '../../guards'
import { content } from '../../routes';
import * as select from '../../selectors';
import { BookWithOSWebData, PageReferenceMap } from '../../types';
import { getBookPageUrlAndParams, toRelativeUrl } from '../../utils/urlUtils';

export const mapStateToContentLinkProp = (state: AppState) => ({
  book: select.book(state),
  currentPath: selectNavigation.pathname(state),
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

const isPathRefernceForBook = (pathname: string, book: BookWithOSWebData) => (ref: PageReferenceMap) =>
  content.getUrl(ref.params) === pathname
    && (
      ('book' in ref.params && ref.params.book === book.slug)
      || ('uuid' in ref.params && ref.params.uuid === book.id)
    );

export const contentLinkHandler = (anchor: HTMLAnchorElement, getProps: () => ContentLinkProp) => (e: MouseEvent) => {
  const {references, navigate, book, page, locationState, currentPath} = getProps();
  const href = anchor.getAttribute('href');

  if (!href || !book || !page || e.metaKey) {
    return;
  }

  const {hash, search, pathname} = new URL(href, assertWindow().location.href);
  const reference = hasOSWebData(book) && references.find(isPathRefernceForBook(pathname, book));

  if (reference) {
    e.preventDefault();
    // defer to allow other handlers to execute before nav happens
    defer(() => navigate({
      params: reference.params,
      route: content,
      state: {
        ...locationState,
        ...reference.state,
      },
    }, {hash, search}));
  } else if (pathname === currentPath && hash) {
    e.preventDefault();
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
