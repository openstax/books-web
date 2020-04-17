import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { AppState, Dispatch } from '../../../../types';
import { assertWindow } from '../../../../utils';
import PrintButton from '../../../components/Toolbar/PrintButton';
import { printSummaryHighlights } from '../../actions';
import { hasMoreResults, summaryIsLoading } from '../../selectors';

interface Props {
  className?: string;
  isLoading: boolean;
  shouldFetchMore: boolean;
  loadHighlightsAndPrint: typeof printSummaryHighlights;
}

// tslint:disable-next-line:variable-name
const StyledPrintButton = styled(PrintButton)`
  min-width: auto;
  height: max-content;
  margin-left: auto;
  cursor: ${({isLoading}) => isLoading ? 'wait' : 'pointer'};
`;

// tslint:disable-next-line:variable-name
const HighlightsPrintButton = ({className, isLoading, loadHighlightsAndPrint, shouldFetchMore}: Props) => {
  return <StyledPrintButton
    className={className}
    isLoading={isLoading}
    onClick={() =>  shouldFetchMore ? loadHighlightsAndPrint() : assertWindow().print()}
    data-testid='hl-print-button'
    disabled={isLoading}
  />;
};

// tslint:disable-next-line:variable-name
export default connect(
  (state: AppState) => ({
    isLoading: summaryIsLoading(state),
    shouldFetchMore: hasMoreResults(state),
  }),
  (dispatch: Dispatch) => ({
    loadHighlightsAndPrint: () => dispatch(printSummaryHighlights()),
  })
)(HighlightsPrintButton);
