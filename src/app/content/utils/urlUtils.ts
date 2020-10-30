import { APP_ENV, BOOKS } from '../../../config';
import { locationState } from '../../navigation/selectors';
import { AppState } from '../../types';
import { assertNotNull } from '../../utils';
import { content as contentRoute } from '../routes';
import { bookAndPage, contentParams } from '../selectors';
import { Book, BookWithOSWebData, Page, Params } from '../types';
import { findArchiveTreeNodeById, findArchiveTreeNodeByPageParam } from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';

export function bookDetailsUrl(book: BookWithOSWebData) {
  return `/details/books/${book.slug}`;
}

export const getBookPageUrlAndParams = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>,
  page: Pick<Page, 'id' | 'title'>
) => {
  const params: Params = {
    book: getUrlParamsForBook(book),
    page: getUrlParamForPageId(book, page.id),
  };
  const state = {
    bookUid: book.id,
    bookVersion: book.version,
    pageUid: stripIdVersion(page.id),
  };

  const search = contentRoute.getSearch && contentRoute.getSearch(params);
  const query = search ? `?${search}` : '';

  return {params, state, url: contentRoute.getUrl(params) + query};
};

export const getUrlParamsForBook = (
  book: Pick<Book, 'id' | 'tree' | 'title' | 'version'> & Partial<{slug: string}>
): Params['book'] => {
  if ('slug' in book && book.slug && BOOKS[book.id]) {
    return book.version === BOOKS[book.id].defaultVersion
      ? {slug: book.slug}
      : {slug: book.slug, version: book.version};
  } else {
    return {uuid: book.id, version: book.version};
  }
};

export const getContentParams = (appState: AppState) => {
  const { book, page } = bookAndPage(appState);

  if (book && page) {
    const {params, state} = getBookPageUrlAndParams(book, page);

    return {
      params,
      route: contentRoute,
      state,
    };
  } else {
    const params = assertNotNull(contentParams(appState), 'Can\'t get params before processing the route');
    const state = locationState(appState);

    return {
      params,
      route: contentRoute,
      state,
    };
  }
};

const getUrlParamForPageIdCache = new Map();
export const getUrlParamForPageId = (book: Pick<Book, 'id' | 'tree' | 'title'>, pageId: string): Params['page'] => {

  const cacheKey = `${book.id}:${pageId}`;

  if (getUrlParamForPageIdCache.has(cacheKey)) {
    return getUrlParamForPageIdCache.get(cacheKey);
  }

  const treeSection = findArchiveTreeNodeById(book.tree, pageId);
  if (!treeSection) {
    throw new Error(`BUG: could not find page "${pageId}" in ${book.title}`);
  }

  if (APP_ENV === 'production' && !treeSection.slug) {
    throw new Error(`could not find page slug for "${pageId}" in ${book.title}`);
  }

  const param = treeSection.slug
    ? {slug: treeSection.slug}
    : {uuid: treeSection.id};

  getUrlParamForPageIdCache.set(cacheKey, param);
  return param;
};

export const getPageIdFromUrlParam = (book: Book, pageParam: Params['page']): string | undefined => {
  if ('uuid' in pageParam) {
    return pageParam.uuid;
  }

  const pageNode = findArchiveTreeNodeByPageParam(book.tree, pageParam);
  if (!pageNode) { return; }

  return stripIdVersion(pageNode.id);
};

const getCommonParts = (firstPath: string[], secondPath: string[]) => {
  const result = [];

  for (let i = 0; i < firstPath.length; i++) {
    if (firstPath[i] === secondPath[i]) {
      result.push(firstPath[i]);
    } else {
      break;
    }
  }
  return result;
};

export const toRelativeUrl = (from: string, to: string) => {
  const parsedFrom = from.split('/');
  const parsedTo = to.split('/');

  // remove the last piece of the "to" so that it is always output
  const commonParts = getCommonParts(parsedFrom, parsedTo.slice(0, -1));

  return '../'.repeat(Math.max(0, parsedFrom.length - commonParts.length - 1))
    + parsedTo.slice(commonParts.length).join('/');
};

export const fromRelativeUrl = (base: string, to: string) => {
  // this hostname is required by the URL constructor but we ignore it in our response, the value is irrelevant
  const urlBase = new URL(to, `https://openstax.org${base}`);
  return urlBase.pathname + urlBase.search + urlBase.hash;
};
