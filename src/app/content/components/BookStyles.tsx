import bookStyles from 'cnx-recipes/styles/output/intro-business.json';
import { ReactElement } from 'react';
import styled from 'styled-components';

// tslint:disable-next-line:variable-name
const hoc = ({children, className}: {className?: string, children: (className?: string) => ReactElement<any>}) =>
  children(className);

export default styled(hoc)`
  ${bookStyles}
`;
