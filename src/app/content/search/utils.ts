import Highlighter, { Highlight } from '@openstax/highlighter';
import { SearchResult, SearchResultHit } from '@openstax/open-search-client';
import { HTMLElement } from '@openstax/types/lib.dom';
import { Location } from 'history';
import sortBy from 'lodash/fp/sortBy';
import { RangyRange, TextRange } from 'rangy';
import rangy, { findTextInRange } from '../../../helpers/rangy';
import { RouteState } from '../../navigation/types';
import { getAllRegexMatches } from '../../utils';
import { content } from '../routes';
import { ArchiveTree, LinkedArchiveTree, LinkedArchiveTreeNode } from '../types';
import { archiveTreeSectionIsChapter, archiveTreeSectionIsPage, linkArchiveTree } from '../utils/archiveTreeUtils';
import { getIdVersion, stripIdVersion } from '../utils/idUtils';
import { isSearchResultChapter } from './guards';
import { SearchResultContainer, SearchResultPage, SelectedResult } from './types';

export const getFirstResult = (book: {tree: ArchiveTree}, results: SearchResult): SelectedResult | null => {
  const [result] = getFormattedSearchResults(book.tree, results);
  const findFirstResultPage = (container: SearchResultContainer): SearchResultPage => isSearchResultChapter(container)
    ? findFirstResultPage(container.contents[0])
    : container;

  const firstResultPage = result && findFirstResultPage(result);
  const firstResult = firstResultPage && firstResultPage.results[0];

  if (firstResult) {
    return {result: firstResult, highlight: 0};
  }

  return null;
};

export const getFormattedSearchResults = (bookTree: ArchiveTree, searchResults: SearchResult) =>
  filterTreeForSearchResults(linkArchiveTree(bookTree), searchResults);

export const getSearchResultsForPage = (page: {id: string}, results: SearchResult) =>
  sortBy('source.pagePosition',
    results.hits.hits.filter((result) => stripIdVersion(result.source.pageId) ===  stripIdVersion(page.id))
  );

const filterTreeForSearchResults = (
  node: LinkedArchiveTree,
  searchResults: SearchResult
): SearchResultContainer[]  => {
  const containers: SearchResultContainer[] = [];
  const linkContents = (parent: LinkedArchiveTree): LinkedArchiveTreeNode[] =>
    parent.contents.map((child) => ({...child, parent}));

  for (const child of linkContents(node)) {
    if (archiveTreeSectionIsPage(child)) {
      const results = getSearchResultsForPage(child, searchResults);

      if (results.length > 0) {
        containers.push({...child, results});
      }
    } else if (archiveTreeSectionIsChapter(child)) {
      const contents = filterTreeForSearchResults(child, searchResults);

      if (contents.length > 0) {
        containers.push({...child, contents});
      }
    } else { // must be an non-chapter ArchiveTree
      containers.push(...filterTreeForSearchResults(child, searchResults));
    }
  }

  return containers;
};

export const getIndexData = (indexName: string) => {
  const tail = getIdVersion(indexName);

  if (!tail) {
    throw new Error(`impropertly formatted index string: "${indexName}"`);
  }

  const [version, indexingStrategy] = tail.split('_');

  return {
    bookId: stripIdVersion(indexName),
    indexingStrategy,
    version,
  };
};

export const countTotalHighlights = (results: SearchResultHit[]) => {
  return results.reduce((count, hit) => count + hit.highlight.visibleContent.length, 0);
};

export const getSearchFromLocation = (location: Location): RouteState<typeof content>['search'] =>
  location.state && location.state.search;

const getHighlightPartMatches = getAllRegexMatches(/.{0,10}(<strong>.*?<\/strong>(\s*<strong>.*?<\/strong>)*).{0,10}/g);

const getHighlightRanges = (element: HTMLElement, highlight: string): Array<RangyRange & TextRange> => {
  const elementRange = rangy.createRange();
  elementRange.selectNodeContents(element);

  // search replaces non-text inline elements with `…`, which breaks the text matchin in the element,
  // luckily you can't actually search for non-text elements, so they won't be in a matches
  // only in surrounding context, so find matches in each part separately
  return highlight.split('…').map((part) => {
    const partMatches = getHighlightPartMatches(part)
      .map((match) => ({
          context: match[0].replace(/<\/?strong>|\n/g, ''),
          match: match[1].replace(/<\/?strong>|\n/g, ''),
      }));

    if (partMatches.length === 0) {
      return [];
    }

    const [partRange] = findTextInRange(elementRange, part.replace(/<\/?strong>|\n/g, ''));

    if (!partRange) {
      // TODO - log
      return [];
    }

    return partMatches
      .map(({context, match}) =>
        findTextInRange(partRange, context)
          .map((contextRange) => findTextInRange(contextRange, match))
          .reduce((flat, sub) => [...flat, ...sub], [])
      )
      .reduce((flat, sub) => [...flat, ...sub], [])
    ;
  })
    .reduce((flat, sub) => [...flat, ...sub], [])
  ;
};

export const highlightResults = (
  highlighter: Highlighter,
  results: SearchResultHit[]
): Array<{result: SearchResultHit, highlights: {[key: number]: Highlight[]}}> =>
  results.map((hit) => {
    const element = highlighter.getReferenceElement(hit.source.elementId) as HTMLElement;

    if (!element) {
      return {result: hit, highlights: []};
    }

    const hitHighlights = hit.highlight.visibleContent.map((highlightText, index) => {
      const highlights = getHighlightRanges(element, highlightText).map((range) => {
        const highlight = new Highlight(range.nativeRange, range.toString());
        highlighter.highlight(highlight);
        return highlight;
      });

      return {index, highlights};
    })
      .reduce((map, {index, highlights}) => ({
        ...map,
        [index]: highlights,
      }), {} as {[key: number]: Highlight[]})
    ;

    return {result: hit, highlights: hitHighlights};
  })
  ;
