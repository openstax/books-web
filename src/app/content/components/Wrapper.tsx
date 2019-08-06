import styled from 'styled-components/macro';
import { LayoutBody } from '../../components/Layout';

export { wrapperPadding } from '../../components/Layout';

export default styled(LayoutBody)`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
`;
