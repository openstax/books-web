import React, { Component } from 'react';
import { connect } from 'react-redux';
import withServices from '../../context/Services';
import styled from 'styled-components';
import theme from '../../theme';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
import {ChevronLeft} from 'styled-icons/boxicons-regular/ChevronLeft'
import { findArchiveTreeSection } from '../utils'

const LeftArrow = styled(ChevronLeft)`
  height: 2rem;
  width: 2rem;
  color: #FFFFFF;
  margin-right: 7px;
`;

interface PropTypes {
    page?: Page;
    book?: Book;
    services: AppServices;
}

const TopBar = styled.div`
  height: 13rem;
  width: 100%;
  max-width: 1170px;
  font-size: 1.25rem;
  font-weight: bold;
  background: transparent;
  margin: 0 auto;
  text-align: left;
`;

const BookTitle = styled.h4`
  letter-spacing: -0.4;
  color: #FFFFFF;
  text-align: left;
  display: inline-block;
  width: 87rem;
  margin-top: 25px;
`;

const BookChapter = styled.h3`
  letter-spacing: -0.4;
  color: #FFFFFF;
  font-weight: bold;
  text-align: left;
  display: inline-block;
  width: 87rem;
`;

const BarWrapper = styled.div`
  width: 100%;
  text-align: center;
  padding: 0 135px;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
  display: inline-block;
  background: ${theme.color.primary.blue.base};
`;

export class TitleComponent extends Component<PropTypes> {
  public render() {
    const {page, book} = this.props as PropTypes;
    
    if (!book || !page) {
      return null
    }

    const treeSection = findArchiveTreeSection(book, page.id);

    if(!treeSection) {
      return null;
    }

      return <BarWrapper>
        <TopBar>
          <BookTitle><LeftArrow/>{book.tree.title}</BookTitle>
          <BookChapter dangerouslySetInnerHTML={{__html: treeSection.title}}></BookChapter>
        </TopBar>
    </BarWrapper>;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
  })
)(withServices(TitleComponent));

