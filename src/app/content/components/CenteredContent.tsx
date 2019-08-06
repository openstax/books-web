import styled from 'styled-components/macro';
import { contentWrapperMaxWidth } from './constants';

export default styled.div`
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
`;
