import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import ChapterFilter from '../../../components/popUp/ChapterFilter';
import Filters, { FilterDropdown } from '../../../components/popUp/Filters';
import FiltersList from '../../../components/popUp/FiltersList';
import PrintButton from '../../../components/popUp/PrintButton';
import { printSummaryHighlights, setSummaryFilters } from '../../actions';
import * as select from '../../selectors';
import ColorFilter from './ColorFilter';

// tslint:disable-next-line:variable-name
export const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    locationFiltersWithContent: select.highlightLocationFiltersWithContent(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(ChapterFilter);

// tslint:disable-next-line:variable-name
export const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: select.highlightLocationFilters(state),
    selectedColorFilters: select.summaryColorFilters(state),
    selectedLocationFilters: select.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
export const ConnectedPrintButton = connect(
  (state: AppState) => ({
    isLoading: select.summaryIsLoading(state),
    shouldFetchMore: select.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printSummaryHighlights, dispatch),
  })
)(PrintButton);

export default () =>
  <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter />
    </FilterDropdown>
    <FilterDropdown
      label='i18n:highlighting:filters:colors'
      ariaLabelId='i18n:highlighting:filters:filter-by:aria-label'
    >
      <ColorFilter />
    </FilterDropdown>
    <ConnectedPrintButton />
    <ConnectedFilterList />
  </Filters>;
