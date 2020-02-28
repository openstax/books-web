import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import { isHtmlElement } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertWindow } from '../../../utils';
import { loadMoreSummaryHighlights, printSummaryHighlights } from '../actions';
import { loadMoreDistanceFromBottom } from '../constants';
import * as select from '../selectors';
import Highlights from './Highlights';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';

interface ShowMyHighlightsProps {
  hasMoreResults: boolean;
  summaryIsLoading: boolean;
  loadMore: () => void;
  loadHighlightsAndPrint: (containerRef: React.RefObject<HTMLElement>) => void;
}

class ShowMyHighlights extends Component<ShowMyHighlightsProps, { showGoToTop: boolean }> {
  public myHighlightsBodyRef = React.createRef<HTMLElement>();

  public state = { showGoToTop: false };

  private scrollHandler: (() => void) | undefined;

  public scrollToTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!highlightsBodyRef) {
      return;
    }

    highlightsBodyRef.scrollTop = 0;
  };

  public updateGoToTop = (bodyElement: HTMLElement) => {
    if (bodyElement.scrollTop > 0) {
      this.setState({ showGoToTop: true });
    } else {
      this.setState({ showGoToTop: false });
    }
  };

  public fetchMoreHighlights = (bodyElement: HTMLElement) => {
    if (this.props.summaryIsLoading) { return; }
    const scrollBottom = bodyElement.scrollHeight - bodyElement.offsetHeight - bodyElement.scrollTop;
    if (scrollBottom <= loadMoreDistanceFromBottom && this.props.hasMoreResults) {
      this.props.loadMore();
    }
  };

  public printHighlights = () => {
    if (this.props.hasMoreResults) {
      this.props.loadHighlightsAndPrint(this.myHighlightsBodyRef);
    } else {
      assertWindow().print();
    }
  };

  public componentDidMount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = () => {
        this.updateGoToTop(highlightsBodyRef);
        this.fetchMoreHighlights(highlightsBodyRef);
      };
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
      typesetMath(highlightsBodyRef, assertWindow());
    }
  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public render() {
    return (
      <Styled.ShowMyHighlightsBody
        ref={this.myHighlightsBodyRef}
        data-testid='show-myhighlights-body'
        data-analytics-region='MH popup'
      >
        <Filters printHighlights={this.printHighlights}/>
        <Highlights />
        {this.state.showGoToTop && (
          <Styled.GoToTopWrapper
            onClick={this.scrollToTop}
            data-testid='back-to-top-highlights'
          >
            <Styled.GoToTop>
              <Styled.GoToTopIcon />
            </Styled.GoToTop>
          </Styled.GoToTopWrapper>
        )}
      </Styled.ShowMyHighlightsBody>
    );
  }
}

export default connect((state: AppState) => ({
  hasMoreResults: select.hasMoreResults(state),
  summaryIsLoading: select.summaryIsLoading(state),
}), (dispatch: Dispatch) => ({
  loadHighlightsAndPrint: (containerRef: React.RefObject<HTMLElement>) => {
    dispatch(printSummaryHighlights(containerRef));
  },
  loadMore: () => dispatch(loadMoreSummaryHighlights()),
}))(ShowMyHighlights);
