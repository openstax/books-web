import { SearchResultHit } from '@openstax/open-search-client';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { assertDefined } from '../../../../utils/assertions';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { closeSearchResultsMobile } from '../../actions';
import SearchResultHits from './SearchResultHits';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTerms = ({ book, keyTermHits }: { book: Book, keyTermHits: SearchResultHit[] }) => {
  const dispatch = useDispatch();

  return <Styled.RelatedKeyTerms>
    <Styled.SearchResultsSectionTitle>
      <FormattedMessage id='i18n:search-results:related-key-term:title'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.SearchResultsSectionTitle>
    <SearchResultHits
      book={book}
      hits={keyTermHits}
      testId='related-key-term-result'
      getPage={(hit) => assertDefined(findArchiveTreeNodeById(book.tree, hit.source.pageId), 'hit has to be in a book')}
      onClick={() => dispatch(closeSearchResultsMobile())}
    />
  </Styled.RelatedKeyTerms>;
};

export default RelatedKeyTerms;
