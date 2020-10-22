import { isLinkedArchiveTreeSection } from '../guards';
import { Book, LinkedArchiveTreeSection } from '../types';
import { findArchiveTreeNodeById, flattenArchiveTree } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import { PracticeQuestionsSummary } from './types';

export const pageHasPracticeQuestions = (pageId: string, summary: PracticeQuestionsSummary) => {
  for (const key in summary.countsPerSource) {
    if (key === pageId) { return true; }
  }
  return false;
};

export const getPracticeQuestionsLocationFilters = (
  summary: PracticeQuestionsSummary | null, book: Book | undefined
) => {
  // key is an id of a parent of sections stored in a value
  const locationFilters: Map<string, LinkedArchiveTreeSection[]> = new Map();

  if (!book || !summary) { return locationFilters; }

  const tree = flattenArchiveTree(book.tree);

  for (const node of tree) {
    if (isLinkedArchiveTreeSection(node) && summary.countsPerSource[stripIdVersion(node.id)]) {
      const parentId = stripIdVersion(node.parent.id);
      locationFilters.set(parentId, [...locationFilters.get(parentId) || [], node]);
    }
  }

  return locationFilters;
};

const flattenLocationFilters = (locationFilters: Map<string, LinkedArchiveTreeSection[]>) => {
  let flattened: LinkedArchiveTreeSection[] = [];
  for (const sections of locationFilters.values()) {
    flattened = flattened.concat(sections);
  }
  return flattened;
};

export const getNextPageWithPracticeQuestions = (
  nodeId: string, locationFilters: Map<string, LinkedArchiveTreeSection[]>, book: Book | undefined
) => {
  if (!book) { return; }

  const node = findArchiveTreeNodeById(book.tree, nodeId);

  if (!node) { return; }

  const flatLocationFilters = flattenLocationFilters(locationFilters);
  const flatTree = flattenArchiveTree(book.tree);
  const nodeIndex = flatTree.findIndex((search) => search.id === node.id);

  for (let i = nodeIndex + 1; i < flatTree.length; i++) {
    if (flatLocationFilters.find((section) => section.id === stripIdVersion(flatTree[i].id))) {
      return flatTree[i] as LinkedArchiveTreeSection;
    }
  }

  return undefined;
};