import { Highlight } from '@openstax/highlighter/dist/api';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { bodyCopyRegularStyle, textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { popupPadding } from '../../../styles/PopupStyles';
import { highlightStyles } from '../../constants';

// tslint:disable-next-line:variable-name
const HighlightOuterWrapper = styled.div`
  overflow: visible;
  padding: 0 ${popupPadding}rem 1rem ${popupPadding}rem;

  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile`
    padding: 0 0 1rem 0;
  `}
`;

// tslint:disable-next-line:variable-name
const HighlightAnnotation = styled.div`
  ${textRegularStyle}
  display: flex;
  padding: 1.2rem 0;
  color: ${theme.color.text.black};
  ${theme.breakpoints.mobile`
    padding: 1rem;
  `}
`;

// tslint:disable-next-line:variable-name
const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightContentWrapper = styled.div`
  padding-left: 0.4rem;
  ${(props: {color: string}) => {
    const style = highlightStyles.find((search) => search.label === props.color);

    if (!style) {
      return null;
    }

    return css`
      border-left: solid 0.8rem ${style.passive};
      margin-left: 2.1rem;
    `;
  }}

  ${theme.breakpoints.mobile`
    margin-left: 2rem;
  `}
`;

interface HighlightListElementProps {
  highlight: Highlight;
}

// tslint:disable-next-line:variable-name
const HighlightListElement = ({ highlight }: HighlightListElementProps) => <HighlightOuterWrapper>
  <HighlightAnnotation>
    {highlight.annotation}
  </HighlightAnnotation>
  <HighlightContentWrapper color={highlight.color}>
    <HighlightContent
      className='summary-highlight-content'
      data-highlight-id={highlight.id}
      dangerouslySetInnerHTML={{ __html: highlight.highlightedContent }}
    />
  </HighlightContentWrapper>
</HighlightOuterWrapper>;

export default HighlightListElement;
