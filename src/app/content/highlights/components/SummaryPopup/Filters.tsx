import React from 'react';
import styled from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { highlightStyles } from '../../constants';
import ColorIndicator from '../ColorIndicator';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Filters = ({className}: Props) => {
  // const [selectedColors, setSelectedColors] = React.useState<string[]>([]);

  return <div className={className}>
    <AllOrNone />
    {highlightStyles.map((style) => <Checkbox key={style.label}>
      <ColorIndicator style={style} size='small'/>
      {style.label}
    </Checkbox>)}
  </div>;
};

export default styled(Filters)`
  display: flex;
  flex-direction: column;
  ${textStyle}
  font-size: 1.4rem;
  margin: 1.6rem;

  ${AllOrNone} {
    margin: 0 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
