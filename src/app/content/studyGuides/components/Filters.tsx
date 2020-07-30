import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { loggedOut } from '../../../auth/selectors';
import { AppState, Dispatch } from '../../../types';
import ChapterFilter from '../../components/popUp/ChapterFilter';
import ColorFilter from '../../components/popUp/ColorFilter';
import Filters, { FilterDropdown } from '../../components/popUp/Filters';
import FiltersList from '../../components/popUp/FiltersList';
import PrintButton from '../../components/popUp/PrintButton';
import { printStudyGuides, setSummaryFilters } from '../actions';
import { highlightStyles } from '../constants';
import * as selectors from '../selectors';
import ColorKey from './ColorKey';

// tslint:disable-next-line:variable-name
const ConnectedChapterFilter = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    locationFiltersWithContent: selectors.studyGuidesLocationFiltersWithContent(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(ChapterFilter);

// tslint:disable-next-line: variable-name
const ConnectedColorFilter = connect(
  (state: AppState) => ({
    colorFiltersWithContent: selectors.highlightColorFiltersWithContent(state),
    selectedColorFilters: selectors.summaryColorFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setSummaryFilters: flow(setSummaryFilters, dispatch),
  })
)(ColorFilter);

// tslint:disable-next-line:variable-name
const ConnectedFilterList = connect(
  (state: AppState) => ({
    locationFilters: selectors.studyGuidesLocationFilters(state),
    selectedLocationFilters: selectors.summaryLocationFilters(state),
  }),
  (dispatch: Dispatch) => ({
    setFilters: flow(setSummaryFilters, dispatch),
  })
)(FiltersList);

// tslint:disable-next-line:variable-name
const ConnectedPrintButton = connect(
  (state: AppState) => ({
    disabled: selectors.summaryIsLoading(state),
    loading: selectors.summaryIsLoading(state),
    shouldFetchMore: selectors.hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: flow(printStudyGuides, dispatch),
  }),
  (stateProps, dispatchProps, ownProps) => {
    const {shouldFetchMore, loadHighlightsAndPrint, ...props} = {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
    };

    return shouldFetchMore
      ? {...props, onClick: loadHighlightsAndPrint}
      : props
    ;
  }
)(PrintButton);

export default () => {
  const userLoggedOut = useSelector(loggedOut);

  return <Filters>
    <FilterDropdown
      label='i18n:highlighting:filters:chapters'
      ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
    >
      <ConnectedChapterFilter disabled={userLoggedOut}/>
    </FilterDropdown>
    <FilterDropdown
      label='i18n:highlighting:filters:colors'
      ariaLabelId='i18n:studyguides:popup:filters:filter-by:aria-label'
    >
      <ConnectedColorFilter
        styles={highlightStyles}
        labelKey={(label: HighlightColorEnum) => `i18n:studyguides:popup:filters:${label}`}
      />
    </FilterDropdown>
    <ColorKey />
    <ConnectedPrintButton studyGuidesButton />
    {!userLoggedOut && <ConnectedFilterList />}
  </Filters>;
};
