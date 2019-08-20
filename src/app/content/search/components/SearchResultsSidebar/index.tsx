import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, Dispatch } from '../../../../types';
import * as select from '../../../selectors';
import { Book } from '../../../types';
import { clearSearch, closeSearchResultsMobile } from '../../actions';
import * as selectSearch from '../../selectors';
import { SearchResultContainer } from '../../types';
import { SearchResultsBarWrapper } from './SearchResultsBarWrapper';

interface Props {
  book?: Book;
  query: string | null;
  totalHits: number | null;
  results: SearchResultContainer[] | null;
  onClose: () => void;
  searchResultsOpen: boolean;
  closeSearchResults: () => void;
}

interface State {
  closed: boolean;
  results: SearchResultContainer[] | null;
  query: string | null;
  totalHits: number | null;
}

export class SearchResultsSidebar extends Component<Props, State> {
  public state: State = {
    closed: true,
    query: null,
    results: null,
    totalHits: null,
  };

  public constructor(props: Props) {
    super(props);

    this.state = {
      closed: this.state.closed,
      query: props.query,
      results: props.results,
      totalHits: props.totalHits,
    };
  }

  public componentWillReceiveProps(newProps: Props) {
    if (this.state.results && !newProps.results) {
      this.setState({closed: true});
    } else {
      this.setState({...newProps, closed: !newProps.query});
    }
  }

  public render() {
    return <SearchResultsBarWrapper {...this.props} {...this.state} />;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    query: selectSearch.query(state),
    results: selectSearch.results(state),
    searchResultsOpen: selectSearch.searchResultsOpen(state),
    totalHits: selectSearch.totalHits(state),
  }),
  (dispatch: Dispatch) => ({
    closeSearchResults: () => {
      dispatch(closeSearchResultsMobile());
    },
    onClose: () => {
      dispatch(clearSearch());
    },
  })
)(SearchResultsSidebar);
