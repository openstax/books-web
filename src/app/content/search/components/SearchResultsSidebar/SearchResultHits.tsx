import { SearchResultHit } from '@openstax/open-search-client';
import isEqual from 'lodash/fp/isEqual';
import React from 'react';
import { useSelector } from 'react-redux';
import { ArchiveTreeSection, Book } from '../../../types';
import { isKeyTermHit } from '../../guards';
import { selectedResult as selectedResultSelector } from '../../selectors';
import { SearchScrollTarget } from '../../types';
import RelatedKeyTermContent from './RelatedKeyTermContent';
import * as Styled from './styled';

interface SearchResultHitsProps {
  activeSectionRef?: React.RefObject<HTMLAnchorElement>;
  book: Book;
  hits: SearchResultHit[];
  testId: string;
  getPage: (hit: SearchResultHit) => ArchiveTreeSection;
  onClick: (result: {result: SearchResultHit, highlight: number}) => void;
}

// tslint:disable-next-line: variable-name
const SearchResultHits = ({ activeSectionRef, book, hits, getPage, testId, onClick }: SearchResultHitsProps) => {
  const selectedResult = useSelector(selectedResultSelector);

  return <React.Fragment>
    {hits.map((hit) => {
      return hit.highlight.visibleContent.map((highlight: string, index: number) => {
        const thisResult = {result: hit, highlight: index};
        const isSelected = isEqual(selectedResult, thisResult);
        const target: SearchScrollTarget = {
          elementId: thisResult.result.source.elementId,
          index,
          type: 'search',
        };

        return <Styled.SectionContentPreview
          selectedResult={isSelected}
          data-testid={testId}
          key={index}
          book={book}
          page={getPage(hit)}
          result={thisResult}
          scrollTarget={target}
          onClick={() => onClick(thisResult)}
          {...isSelected && activeSectionRef ?  {ref: activeSectionRef} : {}}
        >
          {isKeyTermHit(hit)
            ? <RelatedKeyTermContent keyTermHit={hit} />
            : <div tabIndex={-1} dangerouslySetInnerHTML={{ __html: highlight }} />}
        </Styled.SectionContentPreview>;
      });
    })}
  </React.Fragment>;
};

export default SearchResultHits;
