import React from 'react';
import { KeyTermHit } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTermContent = ({ keyTermHit }: { keyTermHit: KeyTermHit }) => <Styled.KeyTermContainer tabIndex={-1}>
  <Styled.KeyTerm>{keyTermHit.highlight.title}</Styled.KeyTerm>
  <div dangerouslySetInnerHTML={{ __html: keyTermHit.highlight.visibleContent[0] }} />
</Styled.KeyTermContainer>;

export default RelatedKeyTermContent;
