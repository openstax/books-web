import { AllHtmlEntities } from 'html-entities';
import replaceAccentedCharacters from '../replaceAccentedCharacters';
import { content as contentRoute } from '../routes';
import { Book, LinkedArchiveTreeSection, Page } from '../types';
import { findArchiveTreeSection, flattenArchiveTree } from './archiveTreeUtils';
import { stripIdVersion } from './idUtils';

export function bookDetailsUrl(book: Book) {
  return `/details/books/${book.slug}`;
}

const splitTitleParts = (str: string) => {
  const match = str
    // remove html tags from tree title
    .replace(/<[^>]+>/g, '')
    // split out section number from title
    .match(/^([0-9\.]*)?(.*)$/);

  if (match && match[2]) {
    // ignore the first match which is the whole title
    return match.slice(1);
  } else {
    return [null, null];
  }
};

const getCleanSectionNumber = (section: LinkedArchiveTreeSection): string => {
  return (splitTitleParts(section.title)[0] || splitTitleParts(section.parent.title)[0] || '')
    // use dash instead of '.'
    .replace(/\./g, '-')
  ;
};

const getCleanSectionTitle = (section: LinkedArchiveTreeSection): string => {
  const decoder = new AllHtmlEntities();

  return replaceAccentedCharacters(decoder.decode(splitTitleParts(section.title)[1] || ''))
    // handle space delimiters
    .replace(/[-_]+/g, ' ')
    // remove special characters
    .replace(/[^a-z0-9 ]/gi, '')
    .toLowerCase();
};

const getUrlParamForPageTitle = (section: LinkedArchiveTreeSection): string => {
  const cleanNumber = getCleanSectionNumber(section);
  const cleanTitle = getCleanSectionTitle(section);

  if (!cleanTitle) {
    throw new Error(`BUG: could not URL encode page title: "${section.title}"`);
  }

  return `${cleanNumber ? `${cleanNumber} ` : ''}${cleanTitle}`
    // spaces to dashes
    .replace(/ +/g, '-')
  ;
};

export const getBookPageUrlAndParams = (book: Book, page: Pick<Page, 'id' | 'shortId' | 'title'>) => {
  const params = {
    book: book.slug,
    page: getUrlParamForPageId(book, page.shortId),
  };

  return {params, url: contentRoute.getUrl(params)};
};

const getUrlParamForPageIdCache = new Map();
export const getUrlParamForPageId = (book: Pick<Book, 'id' | 'tree' | 'title'>, pageId: string): string => {
  const cacheKey = `${book.id}:${pageId}`;

  if (getUrlParamForPageIdCache.has(cacheKey)) {
    return getUrlParamForPageIdCache.get(cacheKey);
  }

  const treeSection = findArchiveTreeSection(book, pageId);
  if (!treeSection) {
    throw new Error(`BUG: could not find page "${pageId}" in ${book.title}`);
  }
  const result = getUrlParamForPageTitle(treeSection);

  getUrlParamForPageIdCache.set(cacheKey, result);

  return result;
};

export const getPageIdFromUrlParam = (book: Book, pageParam: string): string | undefined => {
  for (const section of flattenArchiveTree(book.tree)) {
    const sectionParam = getUrlParamForPageTitle(section);
    if (sectionParam && sectionParam.toLowerCase() === pageParam.toLowerCase()) {
      return stripIdVersion(section.id);
    }
  }
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

const trimTrailingSlash = (path: string) => path.replace(/([^\/]{1})\/+$/, '$1');

export const toRelativeUrl = (from: string, to: string) => {
  const parsedFrom = trimTrailingSlash(from).split('/');
  const parsedTo = trimTrailingSlash(to).split('/');

  // remove the last piece of the "to" so that it is always output
  const commonParts = getCommonParts(parsedFrom, parsedTo.slice(0, -1));

  return '../'.repeat(parsedFrom.length - commonParts.length - 1)
    + parsedTo.slice(commonParts.length).join('/');
};
