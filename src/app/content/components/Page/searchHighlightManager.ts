import Highlighter, { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import isEqual from 'lodash/fp/isEqual';
import { scrollTo } from '../../../domUtils';
import { AppState } from '../../../types';
import * as selectSearch from '../../search/selectors';
import { highlightResults } from '../../search/utils';
import allImagesLoaded from '../utils/allImagesLoaded';

interface Services {
  highlighter: Highlighter;
  container: HTMLElement;
  searchResultMap: ReturnType<typeof highlightResults>;
}

export const mapStateToSearchHighlightProp = (state: AppState) => {
  const searchResults = selectSearch.currentPageResults(state);
  const selectedResult = selectSearch.selectedResult(state);

  return {
    searchResults,
    selectedResult: searchResults && selectedResult && searchResults.find(isEqual(selectedResult.result))
      ? selectedResult
      : null,
  };
};
export type HighlightProp = ReturnType<typeof mapStateToSearchHighlightProp>;
export type OptionsCallback = ({
  current,
  previous,
  selectedHighlight,
}: {
  current: HighlightProp,
  previous: HighlightProp,
  selectedHighlight?: Highlight
}) => void;

interface Options {
  forceRedraw: boolean;
  onSelect: OptionsCallback;
}

const updateResults = (services: Services, previous: HighlightProp, current: HighlightProp, options: Options) => {
  if (!options.forceRedraw && previous.searchResults === current.searchResults) {
    return;
  }

  services.highlighter.eraseAll();
  services.searchResultMap = highlightResults(services.highlighter, current.searchResults);
};

const selectResult = (services: Services, previous: HighlightProp, current: HighlightProp, options: Options) => {
  if (!current.selectedResult) {
    return;
  }
  if (!options.forceRedraw && previous.selectedResult === current.selectedResult) {
    return;
  }

  const {selectedResult} = current;

  services.highlighter.clearFocus();

  const elementHighlights = services.searchResultMap.find((map) => isEqual(map.result, selectedResult.result));
  const selectedHighlights = elementHighlights && elementHighlights.highlights[selectedResult.highlight];
  const firstSelectedHighlight = selectedHighlights && selectedHighlights[0];

  if (firstSelectedHighlight) {
    firstSelectedHighlight.focus();
  }

  if (firstSelectedHighlight && previous.selectedResult !== current.selectedResult) {
    allImagesLoaded(services.container).then(
      () => scrollTo(firstSelectedHighlight.elements[0] as HTMLElement)
    );
  }

  options.onSelect({
    current,
    previous,
    selectedHighlight: firstSelectedHighlight,
  });
};

const handleUpdate = (services: Services) => (previous: HighlightProp, current: HighlightProp, options: Options) => {
  updateResults(services, previous, current, options);
  selectResult(services, previous, current, options);
};

const searchHighlightManager = (container: HTMLElement) => {
  const services = {
    container,
    highlighter: new Highlighter(container, {
      className: 'search-highlight',
    }),
    searchResultMap: [],
  };

  return {
    unmount: () => services.highlighter.unmount(),
    update: handleUpdate(services),
  };
};

export default searchHighlightManager;

export const stubManager: ReturnType<typeof searchHighlightManager> = {
  unmount: (): void => undefined,
  update: (): void => undefined,
};
