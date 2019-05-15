import flatten from 'lodash/fp/flatten';
import { isArchiveTree } from '../guards';
import { ArchiveTree, ArchiveTreeSection, LinkedArchiveTreeSection } from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

export function flattenArchiveTree(tree: ArchiveTree): LinkedArchiveTreeSection[] {
  return flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section) ? flattenArchiveTree(section) : [{...section, parent: tree}]))
  ).map((section) => ({
    id: stripIdVersion(section.id),
    parent: section.parent,
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
  }));
}

export const findDefaultBookPage = (book: {tree: ArchiveTree}) => {
  const getFirstTreeSection = (tree: ArchiveTree) => tree.contents.find(isArchiveTree);

  const getFirstTreeSectionOrPage = (tree: ArchiveTree): ArchiveTreeSection => {
    const firstSection = getFirstTreeSection(tree);

    if (firstSection) {
      return getFirstTreeSectionOrPage(firstSection);
    } else {
      return tree.contents[0];
    }
  };

  return getFirstTreeSectionOrPage(book.tree);
};

const sectionMatcher = (pageId: string) => (section: ArchiveTreeSection) =>
  stripIdVersion(section.shortId) === stripIdVersion(pageId)
  || stripIdVersion(section.id) === stripIdVersion(pageId);

export const splitTitleParts = (str: string) => {
  console.log(str);
  const match = str
    // remove html tags from tree title
    //.replace(/<[^>]+>/g, '')
    // split out section number from title
    //.match(/^([0-9\.]*)?(.*)$/);
    .match(/<span class=\\"os-number\\">(.*?)<\/span>/);

  if (match && match[2]) {
    // ignore the first match which is the whole title
    return match.slice(1);
  } else {
    return [null, null];
  }
};

export const findArchiveTreeSection = (
  book: {tree: ArchiveTree},
  pageId: string
): LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(book.tree).find(sectionMatcher(pageId));

interface Sections {
  prev?: LinkedArchiveTreeSection | undefined;
  next?: LinkedArchiveTreeSection | undefined;
}

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): Sections => {
  const flattenTree = flattenArchiveTree(book.tree);
  const index = flattenTree.findIndex(sectionMatcher(pageId));

  return {
    next: flattenTree[index + 1],
    prev: flattenTree[index - 1],
  };
};
