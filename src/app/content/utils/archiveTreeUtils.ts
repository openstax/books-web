import flatten from 'lodash/fp/flatten';
import { isArchiveTree, isLinkedArchiveTree, isLinkedArchiveTreeSection } from '../guards';
import {
  ArchiveTree,
  ArchiveTreeNode,
  ArchiveTreeSection,
  LinkedArchiveTree,
  LinkedArchiveTreeNode,
  LinkedArchiveTreeSection
} from '../types';
import { getIdVersion, stripIdVersion } from './idUtils';

export function flattenArchiveTree(tree: LinkedArchiveTree): Array<LinkedArchiveTree | LinkedArchiveTreeSection> {
  return [tree, ...flatten(tree.contents.map((section) =>
    flatten(isArchiveTree(section)
      ? flattenArchiveTree({...section, parent: tree})
      : [{...section, parent: tree}])
  ))].map((section) => ({
    id: stripIdVersion(section.id),
    shortId: stripIdVersion(section.shortId),
    title: section.title,
    version: getIdVersion(section.id),
    ...(isLinkedArchiveTree(section) ? {
      contents: section.contents,
      parent: section.parent,
    } : {
      parent: section.parent,
    }),
  }));
}

export const linkArchiveTree = (tree: ArchiveTree): LinkedArchiveTree =>
  flattenArchiveTree(tree)[0] as LinkedArchiveTree;

export const findTreePages = (tree: LinkedArchiveTree): LinkedArchiveTreeSection[] =>
  flattenArchiveTree(tree).filter(archiveTreeSectionIsPage);

export const findDefaultBookPage = (book: {tree: ArchiveTree}) => {
  const resolvePage = (target: ArchiveTree | ArchiveTreeSection): ArchiveTreeSection =>
    isArchiveTree(target) ? resolvePage(target.contents[0]) : target;

  const firstSubtree = book.tree.contents.find(isArchiveTree);

  if (firstSubtree) {
    return resolvePage(firstSubtree);
  } else {
    return book.tree.contents[0];
  }
};

const nodeMatcher = (nodeId: string) => (node: ArchiveTreeNode) =>
  stripIdVersion(node.shortId) === stripIdVersion(nodeId)
  || stripIdVersion(node.id) === stripIdVersion(nodeId);

export const splitTitleParts = (str: string) => {
  const match = str
    .match(/(<span class="os-number">(.*?)<\/span>)?.*?<span class="os-text">(.*?)<\/span>/);

  if (match && match[3]) {
    // ignore the first two matches which are the whole title
    return match.slice(2);
  } else {
    /* title did not match the expected HTML format, assume it is
    unbaked (there is no number and the entire thing is the title)*/
    return [null, str];
  }
};

export const getArchiveTreeSectionNumber = (section: ArchiveTreeSection) => splitTitleParts(section.title)[0];

export const findArchiveTreeNode = (
  tree: ArchiveTree,
  nodeId: string
): LinkedArchiveTree | LinkedArchiveTreeSection | undefined =>
  flattenArchiveTree(tree).find(nodeMatcher(nodeId));

export const archiveTreeContainsNode = (
  tree: ArchiveTree,
  nodeId: string
): boolean => !!findArchiveTreeNode(tree, nodeId);

interface Sections {
  prev?: LinkedArchiveTreeSection | undefined;
  next?: LinkedArchiveTreeSection | undefined;
}

export const prevNextBookPage = (
  book: {tree: ArchiveTree},
  pageId: string
): Sections => {
  const flattenTree = findTreePages(book.tree);
  const index = flattenTree.findIndex(nodeMatcher(pageId));

  return {
    next: flattenTree[index + 1],
    prev: flattenTree[index - 1],
  };
};

export const archiveTreeSectionIsBook = (section: LinkedArchiveTreeNode) => !section.parent;
export const archiveTreeSectionIsPage = isLinkedArchiveTreeSection;
export const archiveTreeSectionIsUnit = (section: LinkedArchiveTreeNode) =>
  isArchiveTree(section)
  && !!section.parent
  && archiveTreeSectionIsBook(section.parent)
  && getArchiveTreeSectionNumber(section) === undefined
;
export const archiveTreeSectionIsChapter = (section: LinkedArchiveTreeNode): section is LinkedArchiveTree =>
  isLinkedArchiveTree(section)
  && !archiveTreeSectionIsBook(section)
  && getArchiveTreeSectionNumber(section) !== undefined
;
