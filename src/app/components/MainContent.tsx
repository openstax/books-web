import { HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components/macro';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Consumer } from '../context/SkipToContent';
import { mergeRefs } from '../utils';

interface Props {
  bookSlug: string;
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
}

// tslint:disable-next-line:variable-name
const HideOutline = styled.div`
  outline: none;
`;

// tslint:disable-next-line:variable-name
const MainContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({children, className, bookSlug, ...props}, ref) => <Consumer>
    {({registerMainContent}) => <div
      ref={mergeRefs(ref, registerMainContent)}
      className={className}
      tabIndex={0}
    >
      <HideOutline
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={bookSlug}
        {...props}
      >
        {children}
      </HideOutline>
    </div>}
  </Consumer>
);

export default MainContent;
