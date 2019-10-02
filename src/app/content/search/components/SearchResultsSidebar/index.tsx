import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book } from '../../../types';
import { clearSearch } from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchResultContainer, SelectedResult } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';

interface Props {
  book?: Book;
  query: string | null;
  hasQuery: boolean;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
  selectedResult: SelectedResult | null;
}

interface State {
  results: SearchResultContainer[] | null;
  query: string | null;
  totalHits: number | null;
  selectedResult: SelectedResult | null;
}

export class SearchResultsSidebar extends Component<Props, State> {
  public state: State = {
    query: null,
    results: null,
    selectedResult: null,
    totalHits: null,
  };

  public constructor(props: Props) {
    super(props);

    this.state = this.getStateProps(props);
  }

  public componentWillReceiveProps(newProps: Props) {
    if (newProps.results || (newProps.query !== this.state.query)) {
      this.setState(this.getStateProps(newProps));
    }
  }

  public render() {
    return <SearchResultsBarWrapper {...this.props} {...this.state} />;
  }

  private getStateProps(props: Props) {
    return {
      query: props.query,
      results: props.results,
      selectedResult: props.selectedResult,
      totalHits: props.totalHits,
    };
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    hasQuery: !!selectSearch.query(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
    selectedResult: selectSearch.selectedResult(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
