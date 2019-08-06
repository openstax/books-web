import React from 'react';
import styled from 'styled-components/macro';
import { H2 } from '../../components/Typography';

interface Props {
  title: string;
}

// tslint:disable-next-line:variable-name
const Wrappper = styled.div`
  padding: 1rem;
`;

// tslint:disable-next-line:variable-name
const Panel: React.SFC<Props> = ({title, children}) => <div>
  <H2>{title}</H2>
  <Wrappper>
    {children}
  </Wrappper>
</div>;

export default Panel;
