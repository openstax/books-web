import { assertDefined } from '../../utils';
import { Book, LinkedArchiveTreeNode, Page } from '../types';
import {
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  findArchiveTreeNodeById,
  getArchiveTreeSectionNumber,
  getArchiveTreeSectionTitle,
  splitTitleParts,
} from './archiveTreeUtils';

const getParentPrefix = (node: LinkedArchiveTreeNode | undefined): string => {
  if (!node) {
    return '';
  }

  if (archiveTreeSectionIsChapter(node)) {
    const number = getArchiveTreeSectionNumber(node);
    return `Ch. ${number} `;
  }

  return archiveTreeSectionIsBook(node.parent)
    ? getArchiveTreeSectionTitle(node) + ' '
    : getParentPrefix(node.parent);

};

export const createTitle = (page: Page, book: Book): string => {
  const node = assertDefined(
    findArchiveTreeNodeById(book.tree, page.id),
    `couldn't find node for a page id: ${page.id}`
  );
  const [nodeNumber, nodeTitle] = splitTitleParts(node.title);
  const title = `${nodeTitle} - ${book.title} | OpenStax`;

  if (nodeNumber) {
    return `${nodeNumber} ${title}`;
  }

  return getParentPrefix(node.parent) + title;
};
